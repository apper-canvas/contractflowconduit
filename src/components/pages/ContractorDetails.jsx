import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Contractors from "@/components/pages/Contractors";
import StatusBadge from "@/components/molecules/StatusBadge";
import { Card, CardContent, CardHeader } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import { timeOffService } from "@/services/api/timeOffService";
import { overtimeService } from "@/services/api/overtimeService";
import { contractorService } from "@/services/api/contractorService";
const ContractorDetails = () => {
  const { id } = useParams();
const navigate = useNavigate();
  const [contractor, setContractor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('personal');
  const [timeOffData, setTimeOffData] = useState([]);
const [overtimeData, setOvertimeData] = useState([]);
  
  useEffect(() => {
    loadContractor();
    loadTimeOffData();
    loadOvertimeData();
  }, [id]);

  const loadContractor = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contractorService.getById(id);
      setContractor(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
}
  };

  const loadTimeOffData = async () => {
    try {
      const data = await timeOffService.getAll();
      // Filter time off records for this contractor (assuming employeeName matches)
      const contractorTimeOff = data.filter(record => 
        record.employeeName === contractor?.name
      );
      setTimeOffData(contractorTimeOff);
    } catch (err) {
      console.error('Error loading time off data:', err);
    }
  };

  const loadOvertimeData = async () => {
    try {
      const data = await overtimeService.getAll();
      // Filter overtime records for this contractor ID
      const contractorOvertime = data.filter(record => 
        record.contractorId === parseInt(id)
      );
      setOvertimeData(contractorOvertime);
    } catch (err) {
      console.error('Error loading overtime data:', err);
    }
  };

  const handleAction = (actionName, actionType = 'info') => {
    const messages = {
      'View Profile': 'Profile view functionality coming soon',
      'Edit Details': 'Edit contractor details functionality coming soon',
      'View Timesheet': 'Timesheet view functionality coming soon',
      'Approve Overtime': 'Overtime approval functionality coming soon',
      'Request Extension': 'Contract extension request functionality coming soon',
      'View Performance': 'Performance review functionality coming soon',
      'Update Status': 'Status update functionality coming soon',
'View Assignment': 'Assignment details functionality coming soon',
      'Submit Timesheet': 'Timesheet submission functionality coming soon',
      'Request Time Off': 'Time off request functionality coming soon',
      'Submit Overtime': 'Overtime submission functionality coming soon',
      'View Schedule': 'Schedule view functionality coming soon',
      'Update Profile': 'Profile update functionality coming soon'
    };

    const message = messages[actionName] || `${actionName} functionality coming soon`;
    
    if (actionType === 'success') {
      toast.success(message);
    } else if (actionType === 'warning') {
      toast.warning(message);
    } else if (actionType === 'error') {
      toast.error(message);
    } else {
      toast.info(message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) return <Loading />;
if (error) return <Error title="Error Loading Contractor" message={error} onRetry={loadContractor} />;
  if (!contractor) return <Error title="Contractor Not Found" message="The requested contractor could not be found." />;
const menuItems = [
    { id: 'personal', label: 'Personal Information', icon: 'User' },
    { id: 'financial', label: 'Financial Information', icon: 'DollarSign' },
    { id: 'history', label: 'Position History', icon: 'Clock' },
    { id: 'timeoff', label: 'Time Off & Overtime History', icon: 'Calendar' },
    { id: 'equipment', label: 'Equipment & Access', icon: 'Monitor' }
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'personal':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Personal Information Panel */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-900">{contractor.name}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-900">{contractor.email}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-900">{contractor.phone}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Department
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-900">{contractor.department}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Direct Manager
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-900">{contractor.manager}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hourly Rate
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-900">{formatCurrency(contractor.hourlyRate)}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Skills & Expertise
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex flex-wrap gap-2">
                          {contractor.skills?.map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Current Assignment Panel */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-semibold text-gray-900">Current Assignment</h2>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Workplan
                      </label>
<div className="p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-900">
                          {contractor.workplanName || 'No workplan assigned'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-900">{formatDate(contractor.startDate)}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-900">{formatDate(contractor.endDate)}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Days Remaining
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className={`font-medium ${
                          contractor.daysRemaining <= 30 ? 'text-red-600' : 
                          contractor.daysRemaining <= 60 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {contractor.daysRemaining} days
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Role-Based Actions Panel */}
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-semibold text-gray-900">Actions</h2>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Resource Team Actions */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Resource Team</h3>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => handleAction('View Timesheet')}
                        >
                          <ApperIcon name="Clock" size={16} className="mr-2" />
                          View Timesheet
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => handleAction('Approve Overtime')}
                        >
                          <ApperIcon name="CheckCircle" size={16} className="mr-2" />
                          Approve Overtime
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => handleAction('Request Extension')}
                        >
                          <ApperIcon name="Calendar" size={16} className="mr-2" />
                          Request Extension
                        </Button>
                      </div>
                    </div>

                    {/* Supervisor Actions */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Supervisor</h3>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => handleAction('View Performance')}
                        >
                          <ApperIcon name="TrendingUp" size={16} className="mr-2" />
                          View Performance
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => handleAction('Update Status')}
                        >
                          <ApperIcon name="Settings" size={16} className="mr-2" />
                          Update Status
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => handleAction('View Assignment')}
                        >
                          <ApperIcon name="Briefcase" size={16} className="mr-2" />
                          View Assignment
                        </Button>
                      </div>
                    </div>
</div>

                    {/* Contractor Actions */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Contractor</h3>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => handleAction('Submit Timesheet')}
                        >
                          <ApperIcon name="FileText" size={16} className="mr-2" />
                          Submit Timesheet
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => handleAction('Request Time Off')}
                        >
                          <ApperIcon name="Calendar" size={16} className="mr-2" />
                          Request Time Off
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => handleAction('View Schedule')}
                        >
                          <ApperIcon name="CalendarDays" size={16} className="mr-2" />
                          View Schedule
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => handleAction('Update Profile')}
                        >
                          <ApperIcon name="User" size={16} className="mr-2" />
                          Update Profile
                        </Button>
                      </div>
                    </div>

                    {/* Offboarding Actions */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Offboarding</h3>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => navigate(`/offboarding/create/${contractor.Id}`)}
                        >
                          <ApperIcon name="UserX" size={16} className="mr-2" />
                          Start Offboarding
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case 'financial':
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Financial Information</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction('View Invoice System', 'info')}
                >
                  <ApperIcon name="FileText" size={16} className="mr-2" />
                  View Invoices
                </Button>
              </div>
            </CardHeader>
<CardContent className="space-y-6">
              {/* Rate and Billing Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Rate
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(contractor.hourlyRate)}
                    </span>
                    <span className="text-sm text-gray-600">/hour</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Billing Type
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-lg font-semibold text-gray-900">
                      {contractor.billingType}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Standard Hours
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-lg font-semibold text-gray-900">
                      {contractor.standardHours} hrs/week
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overtime Rate
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-lg font-semibold text-gray-900">
                      {formatCurrency(contractor.overtimeRate)}
                    </span>
                    <span className="text-sm text-gray-600">/hour (1.5x)</span>
                  </div>
                </div>
              </div>

              {/* Budget and Cost Information */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Source
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900 font-medium">
                      {contractor.budgetSource}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost Center
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900 font-medium">
                      {contractor.costCenter}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Cost Estimate
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-lg font-bold text-accent">
                      {formatCurrency(contractor.monthlyCost)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Terms and Invoice Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Terms
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900 font-medium">
                      {contractor.paymentTerms}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Submission
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900 font-medium">
                      {contractor.invoiceSubmission}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Invoice
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-gray-900 font-medium mr-2">
                        {contractor.lastInvoice}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        {contractor.lastInvoiceStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'history':
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Position History</h2>
<div className="text-sm text-gray-600">
                  Total Time with ADB: {contractor.totalTimeWithADB}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Current Position */}
                <div className="border-l-4 border-blue-500 pl-4 bg-blue-50/30 rounded-r-lg p-4">
                  <div className="flex items-center justify-between mb-3">
<div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {contractor.currentPosition?.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {contractor.currentPosition?.department || contractor.department} | {contractor.currentPosition?.duration}
                      </p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={contractor.status} />
                      <p className="text-sm text-gray-600 mt-1">Current</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Rate
</label>
                      <span className="text-sm text-gray-900 font-medium">
                        {formatCurrency(contractor.hourlyRate)}/hr
                      </span>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Project
</label>
                      <span className="text-sm text-gray-900">
                        {contractor.currentPosition?.project}
                      </span>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Reporting Manager
                      </label>
                      <span className="text-sm text-gray-900">{contractor.manager}</span>
                    </div>
                  </div>
                </div>

                {/* Previous Positions */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 mb-3">Previous Positions:</h3>
                  
                  {/* Position 1 */}
                  <div className="border-l-4 border-gray-300 pl-4 bg-gray-50/50 rounded-r-lg p-4">
                    <div className="flex items-center justify-between mb-2">
<div>
                        <h4 className="font-medium text-gray-900">
                          {contractor.previousPositions?.[0]?.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {contractor.previousPositions?.[0]?.department} | {contractor.previousPositions?.[0]?.duration}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <ApperIcon 
                              key={i} 
name="Star" 
                              className={i < (contractor.previousPositions?.[0]?.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                      <div>
<label className="block text-xs font-medium text-gray-500 mb-1">Rate</label>
                        <span className="text-sm text-gray-900">
                          {formatCurrency(contractor.previousPositions?.[0]?.rate)}/hr
                        </span>
                      </div>
                      <div>
<label className="block text-xs font-medium text-gray-500 mb-1">Project</label>
                        <span className="text-sm text-gray-900">
                          {contractor.previousPositions?.[0]?.project}
                        </span>
                      </div>
                      <div>
<label className="block text-xs font-medium text-gray-500 mb-1">Supervisor</label>
                        <span className="text-sm text-gray-900">
                          {contractor.previousPositions?.[0]?.supervisor}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Position 2 */}
                  <div className="border-l-4 border-gray-300 pl-4 bg-gray-50/50 rounded-r-lg p-4">
                    <div className="flex items-center justify-between mb-2">
<div>
                        <h4 className="font-medium text-gray-900">
                          {contractor.previousPositions?.[1]?.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {contractor.previousPositions?.[1]?.department} | {contractor.previousPositions?.[1]?.duration}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <ApperIcon 
                              key={i} 
name="Star" 
                              className={i < (contractor.previousPositions?.[1]?.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                      <div>
<label className="block text-xs font-medium text-gray-500 mb-1">Rate</label>
                        <span className="text-sm text-gray-900">
                          {formatCurrency(contractor.previousPositions?.[1]?.rate)}/hr
                        </span>
                      </div>
                      <div>
<label className="block text-xs font-medium text-gray-500 mb-1">Project</label>
                        <span className="text-sm text-gray-900">
                          {contractor.previousPositions?.[1]?.project}
                        </span>
                      </div>
                      <div>
<label className="block text-xs font-medium text-gray-500 mb-1">Supervisor</label>
                        <span className="text-sm text-gray-900">
                          {contractor.previousPositions?.[1]?.supervisor}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
</Card>
        );

      case 'timeoff': {
        // Calculate YTD totals for 2024
        const currentYear = 2024;
        const ytdTimeOff = timeOffData
          .filter(record => {
            const recordYear = new Date(record.startDate).getFullYear();
            return recordYear === currentYear && record.status === 'Approved';
          })
          .reduce((total, record) => total + record.hours, 0);

        const ytdOvertime = overtimeData
          .filter(record => {
            const recordYear = new Date(record.date).getFullYear();
            return recordYear === currentYear && record.status === 'approved';
          })
          .reduce((total, record) => total + record.hours, 0);

        return (
          <div className="space-y-6">
            {/* Time Off Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Time Off Taken (2024)</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction('Request Time Off')}
                  >
                    <ApperIcon name="Calendar" size={16} className="mr-2" />
                    Request Time Off
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Time Off Records */}
                  {timeOffData.length > 0 ? (
                    <div className="space-y-3">
                      {timeOffData
                        .filter(record => new Date(record.startDate).getFullYear() === currentYear)
                        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
                        .map((record, index) => (
                        <div key={record.Id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">
                                {new Date(record.startDate).toLocaleDateString('en-US', { 
                                  day: '2-digit', 
                                  month: 'short' 
                                })}
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {record.reason} ({record.hours} hrs)
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <StatusBadge status={record.status.toLowerCase()} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <ApperIcon name="Calendar" size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>No time off records found for 2024</p>
                    </div>
                  )}
                  
                  {/* YTD Total */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">Total YTD:</span>
                      <span className="text-lg font-bold text-primary">{ytdTimeOff} hours</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Overtime History Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Overtime History (2024)</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction('Submit Overtime')}
                  >
                    <ApperIcon name="Clock" size={16} className="mr-2" />
                    Submit Overtime
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Overtime Records */}
                  {overtimeData.length > 0 ? (
                    <div className="space-y-3">
                      {overtimeData
                        .filter(record => new Date(record.date).getFullYear() === currentYear)
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map((record, index) => (
                        <div key={record.Id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">
                                Week of {new Date(record.date).toLocaleDateString('en-US', { 
                                  day: 'numeric', 
                                  month: 'short' 
                                })}
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {record.hours} hrs
                              </span>
                              <span className="text-sm text-gray-600">
                                - {record.reason}
                              </span>
                            </div>
                            {record.description && (
                              <p className="text-xs text-gray-500 mt-1">{record.description}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <StatusBadge status={record.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <ApperIcon name="Clock" size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>No overtime records found for 2024</p>
                    </div>
                  )}
                  
                  {/* YTD Total */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">Total YTD:</span>
                      <span className="text-lg font-bold text-accent">{ytdOvertime} hours</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }
      case 'equipment':
        return (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Equipment & Access</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* IT Equipment */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">IT Equipment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
<div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <ApperIcon name="Laptop" size={20} className="text-gray-600 mr-2" />
                          <span className="font-medium text-gray-900">Laptop</span>
                        </div>
                        <StatusBadge status="active" />
                      </div>
                      <p className="text-sm text-gray-600">
                        {contractor.equipment?.laptop?.model}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Asset: {contractor.equipment?.laptop?.assetId}
                      </p>
                      <p className="text-xs text-gray-500">
                        Serial: {contractor.equipment?.laptop?.serial}
                      </p>
                      <p className="text-xs text-gray-500">
                        Issued: {contractor.equipment?.laptop?.issuedDate}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
<div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <ApperIcon name="Monitor" size={20} className="text-gray-600 mr-2" />
                          <span className="font-medium text-gray-900">Monitor</span>
                        </div>
                        <StatusBadge status="active" />
                      </div>
                      <p className="text-sm text-gray-600">
                        {contractor.equipment?.monitor?.model}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Asset: {contractor.equipment?.monitor?.assetId}
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
<div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <ApperIcon name="Keyboard" size={20} className="text-gray-600 mr-2" />
                          <span className="font-medium text-gray-900">Keyboard & Mouse</span>
                        </div>
                        <StatusBadge status="active" />
                      </div>
                      <p className="text-sm text-gray-600">
                        {contractor.equipment?.keyboard}
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
<div className="flex items-center">
                          <ApperIcon name="Headphones" size={20} className="text-gray-600 mr-2" />
                          <span className="font-medium text-gray-900">Headset</span>
                        </div>
                        <StatusBadge status="active" />
                      </div>
                      <p className="text-sm text-gray-600">
                        {contractor.equipment?.headset}
                      </p>
                    </div>
                  </div>
                </div>

                {/* System Access */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">System Access</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <ApperIcon name="Mail" size={20} className="text-green-600 mr-2" />
                          <span className="font-medium text-gray-900">Email Account</span>
                        </div>
<div className="flex items-center">
                          <ApperIcon name="Check" size={16} className="text-green-600 mr-1" />
                          <span className="text-xs text-green-600">Active</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {contractor.systemAccess?.email}
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <ApperIcon name="Network" size={20} className="text-blue-600 mr-2" />
                          <span className="font-medium text-gray-900">Network Access</span>
                        </div>
                        <div className="flex items-center">
                          <ApperIcon name="Check" size={16} className="text-green-600 mr-1" />
                          <span className="text-xs text-green-600">Standard User</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">Domain privileges granted</p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <ApperIcon name="Key" size={20} className="text-orange-600 mr-2" />
                          <span className="font-medium text-gray-900">VPN Access</span>
                        </div>
                        <div className="flex items-center">
                          <ApperIcon name="Check" size={16} className="text-green-600 mr-1" />
                          <span className="text-xs text-green-600">Enabled</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">Remote access configured</p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <ApperIcon name="Building" size={20} className="text-purple-600 mr-2" />
                          <span className="font-medium text-gray-900">Building Access</span>
                        </div>
                        <div className="flex items-center">
<ApperIcon name="Check" size={16} className="text-green-600 mr-1" />
                          <span className="text-xs text-green-600">Floors 1-15</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        Parking: {contractor.systemAccess?.parking}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Applications */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Applications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { name: 'Microsoft Office 365', icon: 'FileText', status: 'active' },
                      { name: 'JIRA Access', icon: 'Bug', status: 'active' },
                      { name: 'GitHub Repository', icon: 'Github', status: 'active' },
                      { name: 'Confluence', icon: 'BookOpen', status: 'active' },
                      { name: 'SAP (Read-only)', icon: 'Database', status: 'active' },
                      { name: 'AWS Console', icon: 'Cloud', status: 'pending' }
                    ].map((app, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center">
                            <ApperIcon name={app.icon} size={16} className="text-gray-600 mr-2" />
                            <span className="text-sm font-medium text-gray-900">{app.name}</span>
                          </div>
                          <div className="flex items-center">
                            {app.status === 'active' ? (
                              <ApperIcon name="Check" size={14} className="text-green-600" />
                            ) : (
                              <ApperIcon name="Clock" size={14} className="text-orange-600" />
                            )}
                          </div>
                        </div>
                        {app.status === 'pending' && (
                          <span className="text-xs text-orange-600">Pending</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
className="space-y-6"
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/contractors')}
            className="mb-4 p-0 h-auto font-medium text-secondary hover:text-primary"
          >
            <ApperIcon name="ArrowLeft" size={16} className="mr-2" />
            Back to Contractors
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">{contractor.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <StatusBadge status={contractor.status} />
            <span className="text-gray-600">{contractor.department}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('View Profile')}
          >
            <ApperIcon name="User" size={16} className="mr-2" />
            View Profile
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('Edit Details')}
          >
            <ApperIcon name="Edit" size={16} className="mr-2" />
            Edit Details
          </Button>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Menu */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Sections</h2>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center px-4 py-3 text-left text-sm font-medium rounded-none transition-colors ${
                      activeSection === item.id
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <ApperIcon 
                      name={item.icon} 
                      size={16} 
                      className={`mr-3 ${
                        activeSection === item.id ? 'text-white' : 'text-gray-500'
                      }`} 
                    />
                    {item.label}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {renderSectionContent()}
        </div>
      </div>
    </motion.div>
  );
};

export default ContractorDetails;