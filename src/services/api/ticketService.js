import ticketsData from '@/services/mockData/tickets.json';
import { torService } from '@/services/api/torService';
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data for dropdown options
const mockCategories = [
  { Id: 1, name: 'Technical', description: 'Software development and IT roles' },
  { Id: 2, name: 'Finance', description: 'Financial analysis and accounting roles' },
  { Id: 3, name: 'Operations', description: 'Business operations and management' },
  { Id: 4, name: 'Marketing', description: 'Marketing and communications roles' },
  { Id: 5, name: 'Legal', description: 'Legal and compliance positions' },
  { Id: 6, name: 'HR', description: 'Human resources and talent management' },
  { Id: 7, name: 'Offboarding', description: 'Contractor resignation and termination processing' }
];

const mockBudgetSources = [
  { Id: 1, name: 'Capital Projects', code: 'CAP', available: true },
  { Id: 2, name: 'Operational Budget', code: 'OPS', available: true },
  { Id: 3, name: 'Special Projects', code: 'SPE', available: true },
  { Id: 4, name: 'Training Budget', code: 'TRA', available: false },
  { Id: 5, name: 'Digital Transformation', code: 'DIG', available: true },
  { Id: 6, name: 'Infrastructure', code: 'INF', available: true }
];

const mockProjects = [
  { Id: 1, name: 'Core Banking Modernization', status: 'active', manager: 'John Smith' },
  { Id: 2, name: 'Digital Transformation Initiative', status: 'active', manager: 'Lisa Anderson' },
  { Id: 3, name: 'Risk Assessment Initiative', status: 'active', manager: 'Sarah Johnson' },
  { Id: 4, name: 'Mobile Banking Enhancement', status: 'planning', manager: 'Michael Chen' },
  { Id: 5, name: 'Cybersecurity Upgrade', status: 'active', manager: 'Jennifer Williams' },
  { Id: 6, name: 'Data Analytics Platform', status: 'planning', manager: 'David Rodriguez' }
];

const mockWorkArrangements = [
  { Id: 1, name: 'On-site', description: 'Full-time office presence required' },
  { Id: 2, name: 'Remote', description: 'Work from home with occasional office visits' },
  { Id: 3, name: 'Hybrid', description: '2-3 days in office, 2-3 days remote' },
  { Id: 4, name: 'Flexible', description: 'Arrangement based on project needs' }
];

let nextTicketId = Math.max(...ticketsData.map(t => t.Id), 0) + 1;
let nextPositionId = Math.max(...ticketsData.flatMap(t => t.positions.map(p => p.Id)), 0) + 1;
let nextAttachmentId = Math.max(...ticketsData.flatMap(t => t.attachments.map(a => a.Id)), 0) + 1;

// Mock agencies for floating requirements
const mockAgencies = [
  { Id: 1, name: 'TechStaff Solutions', type: 'technical', active: true },
  { Id: 2, name: 'Finance Experts Inc', type: 'finance', active: true },
  { Id: 3, name: 'Operations Pro', type: 'operations', active: true },
  { Id: 4, name: 'Legal Partners', type: 'legal', active: true }
];

// Workflow status validation
const validateStatusTransition = (currentStatus, newStatus) => {
  const validTransitions = {
    'draft': ['submitted'],
    'submitted': ['validated', 'draft'],
    'validated': ['posted', 'submitted'],
    'posted': ['in_progress'],
    'in_progress': ['closed'],
    'closed': []
  };
  
  return validTransitions[currentStatus]?.includes(newStatus) || false;
};

export const ticketService = {
  async getAll() {
    await delay(300);
    return [...ticketsData];
  },

  async getById(id) {
    await delay(200);
    const ticket = ticketsData.find(t => t.Id === parseInt(id));
    if (!ticket) throw new Error('Ticket not found');
    return { ...ticket };
  },

async create(ticketData) {
    await delay(400);
    
    // Process positions with auto-generated IDs
    const positions = ticketData.positions.map(position => ({
      ...position,
      Id: nextPositionId++
    }));

    // Process attachments with auto-generated IDs
    let attachments = (ticketData.attachments || []).map(attachment => ({
      ...attachment,
      Id: nextAttachmentId++,
      uploadDate: new Date().toISOString().split('T')[0]
    }));

    // If TOR is selected, add it as an attachment
    if (ticketData.selectedTor) {
      attachments.unshift({
        Id: nextAttachmentId++,
        name: `${ticketData.selectedTor.title}.pdf`,
        type: 'tor',
        size: 0, // Mock size for template TOR
        uploadDate: new Date().toISOString().split('T')[0],
        url: `templates/tor-${ticketData.selectedTor.Id}.pdf`,
        isTemplate: true,
        torId: ticketData.selectedTor.Id
      });
    }

    const newTicket = {
      ...ticketData,
      Id: nextTicketId++,
      createdDate: new Date().toISOString().split('T')[0],
      status: 'draft',
      attachedTor: ticketData.selectedTor,
      positions,
      attachments,
      workflow: {
        submittedBy: null,
        submittedDate: null,
        validatedBy: null,
        validatedDate: null,
        postedBy: null,
        postedDate: null,
        startedBy: null,
        startedDate: null,
        closedBy: null,
        closedDate: null,
        floatedAgencies: []
      }
    };
    
    ticketsData.push(newTicket);
    return { ...newTicket };
  },

  async update(id, updateData) {
    await delay(350);
    const index = ticketsData.findIndex(t => t.Id === parseInt(id));
    if (index === -1) throw new Error('Ticket not found');
    
    // Handle position updates
    if (updateData.positions) {
      updateData.positions = updateData.positions.map(position => 
        position.Id ? position : { ...position, Id: nextPositionId++ }
      );
    }

    // Handle attachment updates
    if (updateData.attachments) {
      updateData.attachments = updateData.attachments.map(attachment => 
        attachment.Id ? attachment : { 
          ...attachment, 
          Id: nextAttachmentId++,
          uploadDate: new Date().toISOString().split('T')[0]
        }
      );
    }
    
    ticketsData[index] = { ...ticketsData[index], ...updateData };
    return { ...ticketsData[index] };
  },

  async delete(id) {
    await delay(250);
    const index = ticketsData.findIndex(t => t.Id === parseInt(id));
    if (index === -1) throw new Error('Ticket not found');
    
    ticketsData.splice(index, 1);
    return { success: true };
  },

  // Workflow transition methods
  async submitTicket(id, submittedBy = 'Current User') {
    await delay(300);
    const index = ticketsData.findIndex(t => t.Id === parseInt(id));
    if (index === -1) throw new Error('Ticket not found');
    
    const ticket = ticketsData[index];
    if (!validateStatusTransition(ticket.status, 'submitted')) {
      throw new Error('Invalid status transition');
    }
    
    ticketsData[index] = {
      ...ticket,
      status: 'submitted',
      workflow: {
        ...ticket.workflow,
        submittedBy,
        submittedDate: new Date().toISOString().split('T')[0]
      }
    };
    
    return { ...ticketsData[index] };
  },

  async validateTicket(id, validatedBy = 'Resource Team') {
    await delay(350);
    const index = ticketsData.findIndex(t => t.Id === parseInt(id));
    if (index === -1) throw new Error('Ticket not found');
    
    const ticket = ticketsData[index];
    if (!validateStatusTransition(ticket.status, 'validated')) {
      throw new Error('Invalid status transition');
    }
    
    ticketsData[index] = {
      ...ticket,
      status: 'validated',
      workflow: {
        ...ticket.workflow,
        validatedBy,
        validatedDate: new Date().toISOString().split('T')[0]
      }
    };
    
    return { ...ticketsData[index] };
  },

  async postTicket(id, postedBy = 'Admin User') {
    await delay(300);
    const index = ticketsData.findIndex(t => t.Id === parseInt(id));
    if (index === -1) throw new Error('Ticket not found');
    
    const ticket = ticketsData[index];
    if (!validateStatusTransition(ticket.status, 'posted')) {
      throw new Error('Invalid status transition');
    }
    
    ticketsData[index] = {
      ...ticket,
      status: 'posted',
      workflow: {
        ...ticket.workflow,
        postedBy,
        postedDate: new Date().toISOString().split('T')[0]
      }
    };
    
    return { ...ticketsData[index] };
  },

  async startTicket(id, startedBy = 'Project Manager') {
    await delay(300);
    const index = ticketsData.findIndex(t => t.Id === parseInt(id));
    if (index === -1) throw new Error('Ticket not found');
    
    const ticket = ticketsData[index];
    if (!validateStatusTransition(ticket.status, 'in_progress')) {
      throw new Error('Invalid status transition');
    }
    
    ticketsData[index] = {
      ...ticket,
      status: 'in_progress',
      workflow: {
        ...ticket.workflow,
        startedBy,
        startedDate: new Date().toISOString().split('T')[0]
      }
    };
    
    return { ...ticketsData[index] };
  },

  async closeTicket(id, closedBy = 'Admin User') {
    await delay(300);
    const index = ticketsData.findIndex(t => t.Id === parseInt(id));
    if (index === -1) throw new Error('Ticket not found');
    
    const ticket = ticketsData[index];
    if (!validateStatusTransition(ticket.status, 'closed')) {
      throw new Error('Invalid status transition');
    }
    
    ticketsData[index] = {
      ...ticket,
      status: 'closed',
      workflow: {
        ...ticket.workflow,
        closedBy,
        closedDate: new Date().toISOString().split('T')[0]
      }
    };
    
    return { ...ticketsData[index] };
  },

  // Agency floating functionality
  async floatToAgencies(id, agencyIds) {
    await delay(400);
    const index = ticketsData.findIndex(t => t.Id === parseInt(id));
    if (index === -1) throw new Error('Ticket not found');
    
    const ticket = ticketsData[index];
    const selectedAgencies = mockAgencies.filter(agency => 
      agencyIds.includes(agency.Id) && agency.active
    );
    
    const floatedAgencies = selectedAgencies.map(agency => ({
      agencyId: agency.Id,
      agencyName: agency.name,
      floatedDate: new Date().toISOString().split('T')[0],
      status: 'sent'
    }));
    
    ticketsData[index] = {
      ...ticket,
      workflow: {
        ...ticket.workflow,
        floatedAgencies: [...ticket.workflow.floatedAgencies, ...floatedAgencies]
      }
    };
    
    return { 
      success: true, 
      floatedTo: selectedAgencies.map(a => a.name),
      ticket: { ...ticketsData[index] }
    };
  },

  async getAvailableAgencies() {
    await delay(200);
    return [...mockAgencies.filter(a => a.active)];
  },

  // Dropdown data methods
  async getCategories() {
    await delay(150);
    return [...mockCategories];
  },

  async getBudgetSources() {
    await delay(150);
    return [...mockBudgetSources.filter(b => b.available)];
  },

  async getProjects() {
    await delay(150);
    return [...mockProjects.filter(p => p.status === 'active')];
  },

  async getWorkArrangements() {
    await delay(150);
    return [...mockWorkArrangements];
  },
// Contractor integration methods
  async getContractors() {
    await delay(200);
    // Import contractor service dynamically to avoid circular dependency
    const { contractorService } = await import('./contractorService');
    return await contractorService.getAll();
  },

  // TOR integration methods
  async getTors() {
    await delay(200);
    return await torService.getAll();
  },

  // File upload simulation
  async uploadFile(file, type) {
    await delay(1000); // Simulate upload time
    return {
      Id: nextAttachmentId++,
      name: file.name,
      type: type,
      size: file.size,
      uploadDate: new Date().toISOString().split('T')[0],
      url: `uploads/${file.name}` // Mock URL
    };
  }
};