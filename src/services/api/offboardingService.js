import offboardingData from '@/services/mockData/offboarding.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const offboardingService = {
  async getAll() {
    await delay(300);
    return [...offboardingData];
  },

  async getById(id) {
    await delay(200);
    const offboarding = offboardingData.find(o => o.Id === parseInt(id));
    if (!offboarding) throw new Error('Offboarding process not found');
    return { ...offboarding };
  },

  async create(data) {
    await delay(400);
    const newOffboarding = {
      Id: Math.max(...offboardingData.map(o => o.Id)) + 1,
      contractorId: data.contractorId,
      contractorName: data.contractorName || 'Unknown Contractor',
      department: data.department || 'Unknown Department',
      departureDate: data.departureDate,
      lastWorkingDay: data.lastWorkingDay,
      reason: data.reason,
      notes: data.notes || '',
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      completionPercentage: 0,
      clearanceChecklist: [
        {
          Id: 1,
          title: 'IT Equipment Return',
          description: 'Return laptop, monitor, keyboard, mouse, headset',
          responsibleDepartment: 'IT Department',
          completed: false,
          status: 'pending',
          completedAt: null,
          completedBy: null
        },
        {
          Id: 2,
          title: 'Access Card Return',
          description: 'Return building access card and parking pass',
          responsibleDepartment: 'Security',
          completed: false,
          status: 'pending',
          completedAt: null,
          completedBy: null
        },
        {
          Id: 3,
          title: 'System Access Revocation',
          description: 'Revoke email, network, VPN, and application access',
          responsibleDepartment: 'IT Department',
          completed: false,
          status: 'pending',
          completedAt: null,
          completedBy: null
        },
        {
          Id: 4,
          title: 'Knowledge Transfer',
          description: 'Complete handover of ongoing projects and documentation',
          responsibleDepartment: 'Direct Manager',
          completed: false,
          status: 'pending',
          completedAt: null,
          completedBy: null
        },
        {
          Id: 5,
          title: 'HR Documentation',
          description: 'Complete exit interview and final paperwork',
          responsibleDepartment: 'HR Department',
          completed: false,
          status: 'pending',
          completedAt: null,
          completedBy: null
        },
        {
          Id: 6,
          title: 'Final Timesheet',
          description: 'Submit and approve final timesheet and expenses',
          responsibleDepartment: 'Finance Department',
          completed: false,
          status: 'pending',
          completedAt: null,
          completedBy: null
        }
      ],
      signatoryApprovals: [
        {
          Id: 1,
          name: 'Sarah Johnson',
          title: 'Direct Manager',
          department: 'IT Division',
          status: 'pending',
          approvedAt: null,
          comments: null,
          order: 1
        },
        {
          Id: 2,
          name: 'Michael Chen',
          title: 'Department Head',
          department: 'IT Division',
          status: 'pending',
          approvedAt: null,
          comments: null,
          order: 2
        },
        {
          Id: 3,
          name: 'Lisa Anderson',
          title: 'HR Manager',
          department: 'Human Resources',
          status: 'pending',
          approvedAt: null,
          comments: null,
          order: 3
        }
      ]
    };

    offboardingData.push(newOffboarding);
    return { ...newOffboarding };
  },

  async update(id, updateData) {
    await delay(300);
    const index = offboardingData.findIndex(o => o.Id === parseInt(id));
    if (index === -1) throw new Error('Offboarding process not found');
    
    offboardingData[index] = { ...offboardingData[index], ...updateData };
    return { ...offboardingData[index] };
  },

  async delete(id) {
    await delay(250);
    const index = offboardingData.findIndex(o => o.Id === parseInt(id));
    if (index === -1) throw new Error('Offboarding process not found');
    
    offboardingData.splice(index, 1);
    return { success: true };
  },

async updateChecklistItem(offboardingId, itemId, updates) {
    await delay(200);
    const offboarding = offboardingData.find(o => o.Id === parseInt(offboardingId));
    if (!offboarding) throw new Error('Offboarding process not found');
    
    const itemIndex = offboarding.clearanceChecklist.findIndex(item => item.Id === parseInt(itemId));
    if (itemIndex === -1) throw new Error('Checklist item not found');
    
    const item = offboarding.clearanceChecklist[itemIndex];
    
    offboarding.clearanceChecklist[itemIndex] = {
      ...item,
      ...updates,
      completedAt: updates.completed ? new Date().toISOString() : null,
      completedBy: updates.completed ? 'System User' : null
    };
    
    // Send access deactivation notification if this is an access-related item
    if (updates.completed && 
        (item.title.toLowerCase().includes('access') || 
         item.title.toLowerCase().includes('system'))) {
      
      // Create notification for access deactivation
      const notification = {
        id: Date.now(),
        offboardingId: parseInt(offboardingId),
        itemId: parseInt(itemId),
        contractorName: offboarding.contractorName,
        accessType: item.title.toLowerCase().includes('system') ? 'System Access' : 'Physical Access',
        message: `${item.title} has been completed for ${offboarding.contractorName}`,
        timestamp: new Date().toISOString(),
        type: 'access_deactivation',
        department: item.responsibleDepartment
      };
      
      console.log('Access Deactivation Notification:', notification);
    }
    
    // Update completion percentage
    const completedItems = offboarding.clearanceChecklist.filter(item => item.completed).length;
    offboarding.completionPercentage = Math.round((completedItems / offboarding.clearanceChecklist.length) * 100);
    
    return { ...offboarding.clearanceChecklist[itemIndex] };
  },

  async updateSignatoryApproval(offboardingId, signatoryId, approved, comments = '') {
    await delay(200);
    const offboarding = offboardingData.find(o => o.Id === parseInt(offboardingId));
    if (!offboarding) throw new Error('Offboarding process not found');
    
    const signatoryIndex = offboarding.signatoryApprovals.findIndex(s => s.Id === parseInt(signatoryId));
    if (signatoryIndex === -1) throw new Error('Signatory not found');
    
    offboarding.signatoryApprovals[signatoryIndex] = {
      ...offboarding.signatoryApprovals[signatoryIndex],
      status: approved ? 'approved' : 'rejected',
      approvedAt: new Date().toISOString(),
      comments
    };
    
    // Check if all signatories have approved in order
    const allApproved = offboarding.signatoryApprovals.every(s => s.status === 'approved');
    if (allApproved) {
      offboarding.status = 'completed';
    } else if (!approved) {
      offboarding.status = 'rejected';
}
    
    return { ...offboarding.signatoryApprovals[signatoryIndex] };
  },

  async getAccessDeactivationItems() {
    await delay(200);
    const accessItems = [];
    
    offboardingData.forEach(offboarding => {
      offboarding.clearanceChecklist.forEach(item => {
        if ((item.title.toLowerCase().includes('access') || 
             item.title.toLowerCase().includes('system')) && 
            !item.completed) {
          accessItems.push({
            offboardingId: offboarding.Id,
            itemId: item.Id,
            title: item.title,
            contractorName: offboarding.contractorName,
            accessType: item.title.toLowerCase().includes('system') ? 'System Access' : 'Physical Access',
            responsibleDepartment: item.responsibleDepartment,
            status: item.status,
            priority: 'high',
            type: 'access_deactivation'
          });
        }
      });
    });
    
    return accessItems;
  },

  async getPendingItems() {
    await delay(200);
    const pendingItems = [];
    
    offboardingData.forEach(offboarding => {
      if (offboarding.status === 'in_progress') {
        offboarding.clearanceChecklist.forEach(item => {
          if (!item.completed) {
            pendingItems.push({
              offboardingId: offboarding.Id,
              itemId: item.Id,
              title: item.title,
              contractorName: offboarding.contractorName,
              responsibleDepartment: item.responsibleDepartment,
              status: item.status,
              dueDate: offboarding.lastWorkingDay,
              priority: item.title.toLowerCase().includes('access') ? 'high' : 'medium'
            });
          }
        });
      }
    });
    
    return pendingItems.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  },

  async updateAccessStatus(offboardingId, itemId, accessUpdates) {
    await delay(200);
    const offboarding = offboardingData.find(o => o.Id === parseInt(offboardingId));
    if (!offboarding) throw new Error('Offboarding process not found');
    
    const itemIndex = offboarding.clearanceChecklist.findIndex(item => item.Id === parseInt(itemId));
    if (itemIndex === -1) throw new Error('Checklist item not found');
    
    offboarding.clearanceChecklist[itemIndex] = {
      ...offboarding.clearanceChecklist[itemIndex],
      ...accessUpdates,
      completed: true,
      status: 'completed',
      completedAt: new Date().toISOString(),
      completedBy: 'System Administrator'
    };
    
    // Update completion percentage
    const completedItems = offboarding.clearanceChecklist.filter(item => item.completed).length;
    offboarding.completionPercentage = Math.round((completedItems / offboarding.clearanceChecklist.length) * 100);
    
    return { ...offboarding.clearanceChecklist[itemIndex] };
  },

  async sendAccessDeactivationNotification(offboardingId, itemId, accessType) {
    await delay(100);
    const offboarding = offboardingData.find(o => o.Id === parseInt(offboardingId));
    if (!offboarding) throw new Error('Offboarding process not found');
    
    const notification = {
      id: Date.now(),
      offboardingId: parseInt(offboardingId),
      itemId: parseInt(itemId),
      contractorName: offboarding.contractorName,
      accessType,
      message: `${accessType} access has been deactivated for ${offboarding.contractorName}`,
      timestamp: new Date().toISOString(),
      type: 'access_deactivation'
    };
    
    // In a real application, this would send notifications to relevant departments
    console.log('Access Deactivation Notification:', notification);
    
    return notification;
  }
};