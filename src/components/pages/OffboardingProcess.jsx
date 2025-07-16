import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import { Card, CardContent, CardHeader } from '@/components/atoms/Card';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import FormField from '@/components/molecules/FormField';
import StatusBadge from '@/components/molecules/StatusBadge';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import { offboardingService } from '@/services/api/offboardingService';
import { contractorService } from '@/services/api/contractorService';
import { cn } from '@/utils/cn';

const OffboardingProcess = () => {
  const navigate = useNavigate();
  const { id, contractorId } = useParams();
  
  const [offboardingData, setOffboardingData] = useState([]);
  const [selectedOffboarding, setSelectedOffboarding] = useState(null);
  const [contractor, setContractor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('list');
  const [pendingItems, setPendingItems] = useState([]);
  const [accessDeactivationItems, setAccessDeactivationItems] = useState([]);
  const [notificationSystem, setNotificationSystem] = useState({
    accessDeactivationNotifications: [],
    pendingItemsCount: 0,
    lastUpdated: null
  });
  const [pendingItemsFilter, setPendingItemsFilter] = useState('all');
  const [formData, setFormData] = useState({
    contractorId: contractorId || '',
    departureDate: '',
    lastWorkingDay: '',
    reason: '',
    notes: ''
  });

useEffect(() => {
    loadData();
    loadPendingItems();
    loadAccessDeactivationItems();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (id) {
        // View specific offboarding
        const offboarding = await offboardingService.getById(id);
        setSelectedOffboarding(offboarding);
        setActiveView('view');
        
        // Load contractor data
        const contractorData = await contractorService.getById(offboarding.contractorId);
        setContractor(contractorData);
      } else if (contractorId) {
        // Create new offboarding for specific contractor
        const contractorData = await contractorService.getById(contractorId);
        setContractor(contractorData);
        setActiveView('create');
      } else {
        // List all offboardings
        const data = await offboardingService.getAll();
        setOffboardingData(data);
        setActiveView('list');
      }
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load offboarding data');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingItems = async () => {
    try {
      const pending = await offboardingService.getPendingItems();
      setPendingItems(pending);
      setNotificationSystem(prev => ({
        ...prev,
        pendingItemsCount: pending.length,
        lastUpdated: new Date().toISOString()
      }));
    } catch (err) {
      console.error('Failed to load pending items:', err);
    }
  };

  const loadAccessDeactivationItems = async () => {
    try {
      const accessItems = await offboardingService.getAccessDeactivationItems();
      setAccessDeactivationItems(accessItems);
      
      // Check for new access deactivation notifications
      const notifications = accessItems.filter(item => 
        item.status === 'pending' && item.type === 'access_deactivation'
      );
      
      if (notifications.length > 0) {
        setNotificationSystem(prev => ({
          ...prev,
          accessDeactivationNotifications: notifications
        }));
      }
    } catch (err) {
      console.error('Failed to load access deactivation items:', err);
    }
  };

  const handleCreateOffboarding = async (e) => {
    e.preventDefault();
    
    if (!formData.contractorId || !formData.departureDate || !formData.lastWorkingDay || !formData.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const newOffboarding = await offboardingService.create({
        ...formData,
        contractorId: parseInt(formData.contractorId)
      });
      
      toast.success('Offboarding process started successfully');
      navigate(`/offboarding/${newOffboarding.Id}`);
    } catch (err) {
      toast.error('Failed to create offboarding process');
    } finally {
      setLoading(false);
    }
  };

const handleUpdateChecklistItem = async (itemId, updates) => {
    try {
      await offboardingService.updateChecklistItem(selectedOffboarding.Id, itemId, updates);
      
      // Reload the offboarding data to get updated checklist
      const updatedOffboarding = await offboardingService.getById(selectedOffboarding.Id);
      setSelectedOffboarding(updatedOffboarding);
      
      // Reload pending items and access deactivation notifications
      await loadPendingItems();
      await loadAccessDeactivationItems();
      
      toast.success('Checklist item updated successfully');
    } catch (err) {
      toast.error('Failed to update checklist item');
    }
  };

  const handleAccessDeactivation = async (itemId, accessType) => {
    try {
      await offboardingService.updateAccessStatus(selectedOffboarding.Id, itemId, {
        status: 'deactivated',
        deactivatedAt: new Date().toISOString(),
        accessType
      });
      
      // Send access deactivation notification
      await offboardingService.sendAccessDeactivationNotification(
        selectedOffboarding.Id, 
        itemId, 
        accessType
      );
      
      // Reload data to reflect changes
      const updatedOffboarding = await offboardingService.getById(selectedOffboarding.Id);
      setSelectedOffboarding(updatedOffboarding);
      await loadPendingItems();
      await loadAccessDeactivationItems();
      
      toast.success(`${accessType} access deactivated successfully`);
    } catch (err) {
      toast.error(`Failed to deactivate ${accessType} access`);
    }
  };

  const handleSignatoryApproval = async (signatoryId, approved, comments = '') => {
    try {
      await offboardingService.updateSignatoryApproval(selectedOffboarding.Id, signatoryId, approved, comments);
      
      // Reload the offboarding data to get updated status
      const updatedOffboarding = await offboardingService.getById(selectedOffboarding.Id);
      setSelectedOffboarding(updatedOffboarding);
      
      toast.success(`Signatory ${approved ? 'approved' : 'rejected'} successfully`);
    } catch (err) {
      toast.error('Failed to update signatory approval');
    }
  };

  const renderListView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Offboarding Process</h1>
          <p className="text-gray-600">Manage contractor offboarding with automated clearance checklist</p>
        </div>
        <Button onClick={() => setActiveView('create')}>
          <ApperIcon name="Plus" size={16} className="mr-2" />
          New Offboarding
        </Button>
      </div>

      {offboardingData.length === 0 ? (
        <Empty
          title="No Offboarding Processes"
          description="No offboarding processes have been created yet."
          action={
            <Button onClick={() => setActiveView('create')}>
              <ApperIcon name="Plus" size={16} className="mr-2" />
              Create First Offboarding
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {offboardingData.map((offboarding) => (
            <Card key={offboarding.Id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {offboarding.contractorName}
                      </h3>
                      <StatusBadge status={offboarding.status} />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Department: {offboarding.department}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      Last Working Day: {new Date(offboarding.lastWorkingDay).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Reason: {offboarding.reason}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right text-sm text-gray-500">
                      <p>Progress: {offboarding.completionPercentage}%</p>
                      <p>Created: {new Date(offboarding.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedOffboarding(offboarding);
                        setActiveView('view');
                      }}
                    >
                      <ApperIcon name="Eye" size={16} className="mr-2" />
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderCreateView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Offboarding Process</h1>
          <p className="text-gray-600">
            {contractor ? `Starting offboarding for ${contractor.name}` : 'Start a new contractor offboarding process'}
          </p>
        </div>
        <Button variant="outline" onClick={() => setActiveView('list')}>
          <ApperIcon name="ArrowLeft" size={16} className="mr-2" />
          Back to List
        </Button>
      </div>

      <form onSubmit={handleCreateOffboarding} className="space-y-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Offboarding Details</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {!contractor && (
                <FormField label="Contractor" required>
                  <Select
                    value={formData.contractorId}
                    onChange={(e) => setFormData(prev => ({ ...prev, contractorId: e.target.value }))}
                  >
                    <option value="">Select Contractor</option>
                    {/* This would be populated from contractor service */}
                  </Select>
                </FormField>
              )}
              
              {contractor && (
                <div className="md:col-span-2">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Contractor Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Name:</span> {contractor.name}
                      </div>
                      <div>
                        <span className="font-medium">Department:</span> {contractor.department}
                      </div>
                      <div>
                        <span className="font-medium">Manager:</span> {contractor.manager}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <FormField label="Departure Date" required>
                <Input
                  type="date"
                  value={formData.departureDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, departureDate: e.target.value }))}
                />
              </FormField>

              <FormField label="Last Working Day" required>
                <Input
                  type="date"
                  value={formData.lastWorkingDay}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastWorkingDay: e.target.value }))}
                />
              </FormField>

              <FormField label="Departure Reason" required>
                <Select
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                >
                  <option value="">Select Reason</option>
                  <option value="resignation">Resignation</option>
                  <option value="termination">Termination</option>
                  <option value="contract_end">Contract End</option>
                  <option value="non_renewal">Non-Renewal</option>
                  <option value="transfer">Transfer</option>
                </Select>
              </FormField>

              <div className="md:col-span-2">
                <FormField label="Additional Notes">
                  <textarea
                    className="flex min-h-20 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:border-secondary focus:ring-secondary/50"
                    placeholder="Any additional notes or special instructions..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </FormField>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => setActiveView('list')}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <ApperIcon name="Check" size={16} className="mr-2" />
                Start Offboarding
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );

const renderPendingItemsPanel = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Pending Items Tracking</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {pendingItems.length} pending items
            </span>
            <Select 
              value={pendingItemsFilter} 
              onChange={(e) => setPendingItemsFilter(e.target.value)}
              className="w-32"
            >
              <option value="all">All Items</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {pendingItems.length === 0 ? (
          <Empty
            title="No Pending Items"
            description="All offboarding items are up to date."
          />
        ) : (
          <div className="space-y-3">
            {pendingItems
              .filter(item => pendingItemsFilter === 'all' || item.priority === pendingItemsFilter)
              .map((item) => (
                <div key={`${item.offboardingId}-${item.itemId}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        item.priority === 'high' ? 'bg-red-500' : 
                        item.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      )} />
                      <div>
                        <h4 className="font-medium text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.contractorName}</p>
                        <p className="text-xs text-gray-500">
                          Due: {new Date(item.dueDate).toLocaleDateString()} • 
                          Responsible: {item.responsibleDepartment}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.status} />
<Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          const offboarding = await offboardingService.getById(item.offboardingId);
                          setSelectedOffboarding(offboarding);
                          setActiveView('view');
                        } catch (err) {
                          toast.error('Failed to load offboarding details');
                        }
                      }}
                    >
                      <ApperIcon name="ArrowRight" size={16} className="mr-2" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderAccessDeactivationNotifications = () => (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Access Deactivation Notifications</h3>
      </CardHeader>
      <CardContent>
        {accessDeactivationItems.length === 0 ? (
          <Empty
            title="No Access Deactivation Items"
            description="All access deactivation items are processed."
          />
        ) : (
          <div className="space-y-3">
            {accessDeactivationItems.map((item) => (
              <div key={`${item.offboardingId}-${item.itemId}`} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <ApperIcon name="AlertTriangle" size={20} className="text-orange-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.contractorName}</p>
                      <p className="text-xs text-gray-500">
                        Access Type: {item.accessType} • 
                        Responsible: {item.responsibleDepartment}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={item.status} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAccessDeactivation(item.itemId, item.accessType)}
                  >
                    <ApperIcon name="Shield" size={16} className="mr-2" />
                    Deactivate
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderViewDetails = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Offboarding: {selectedOffboarding?.contractorName}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <StatusBadge status={selectedOffboarding?.status} />
            <span className="text-gray-600">
              Progress: {selectedOffboarding?.completionPercentage}%
            </span>
            {notificationSystem.pendingItemsCount > 0 && (
              <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                {notificationSystem.pendingItemsCount} pending items
              </span>
            )}
          </div>
        </div>
        <Button variant="outline" onClick={() => setActiveView('list')}>
          <ApperIcon name="ArrowLeft" size={16} className="mr-2" />
          Back to List
        </Button>
      </div>

      {/* Access Deactivation Notifications Panel */}
      {accessDeactivationItems.length > 0 && renderAccessDeactivationNotifications()}

      {/* Pending Items Panel */}
      {pendingItems.length > 0 && renderPendingItemsPanel()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Offboarding Details */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Offboarding Details</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contractor</label>
                <p className="text-sm text-gray-900">{selectedOffboarding?.contractorName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <p className="text-sm text-gray-900">{selectedOffboarding?.department}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Working Day</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedOffboarding?.lastWorkingDay).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <p className="text-sm text-gray-900 capitalize">{selectedOffboarding?.reason}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedOffboarding?.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

{/* Clearance Checklist */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-lg font-semibold">Clearance Checklist</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedOffboarding?.clearanceChecklist?.map((item) => (
                <div key={item.Id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <ApperIcon 
                        name={item.completed ? "CheckCircle" : "Circle"} 
                        size={20} 
                        className={item.completed ? "text-green-600" : "text-gray-400"}
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Responsible: {item.responsibleDepartment}
                        </p>
                        {item.title.toLowerCase().includes('access') && !item.completed && (
                          <div className="mt-2 flex items-center gap-2 text-orange-600">
                            <ApperIcon name="AlertTriangle" size={14} />
                            <span className="text-xs">Access deactivation required</span>
                          </div>
                        )}
                        {item.completedAt && (
                          <p className="text-xs text-green-600 mt-1">
                            Completed: {new Date(item.completedAt).toLocaleDateString()} 
                            {item.completedBy && ` by ${item.completedBy}`}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.status} />
                    {!item.completed && (
                      <div className="flex gap-2">
                        {item.title.toLowerCase().includes('access') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAccessDeactivation(item.Id, item.title)}
                          >
                            <ApperIcon name="Shield" size={16} className="mr-2" />
                            Deactivate
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateChecklistItem(item.Id, { completed: true, status: 'completed' })}
                        >
                          <ApperIcon name="Check" size={16} className="mr-2" />
                          Complete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Signatory Approvals */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Signatory Approvals</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {selectedOffboarding?.signatoryApprovals?.map((signatory, index) => (
              <div key={signatory.Id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{signatory.name}</h4>
                      <p className="text-sm text-gray-600">{signatory.title}</p>
                      <p className="text-xs text-gray-500">{signatory.department}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={signatory.status} />
                  {signatory.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSignatoryApproval(signatory.Id, false)}
                      >
                        <ApperIcon name="X" size={16} className="mr-2" />
                        Reject
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSignatoryApproval(signatory.Id, true)}
                      >
                        <ApperIcon name="Check" size={16} className="mr-2" />
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) return <Loading />;
  if (error) return <Error title="Error Loading Offboarding" message={error} onRetry={loadData} />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {activeView === 'list' && renderListView()}
      {activeView === 'create' && renderCreateView()}
      {activeView === 'view' && renderViewDetails()}
    </motion.div>
  );
};

export default OffboardingProcess;