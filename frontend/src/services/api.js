import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8080/api', withCredentials: true });

// Auth
export const login = (data) => api.post('/auth/login', data);

// Employees
export const getEmployees = () => api.get('/employees');
export const getEmployee = (id) => api.get(`/employees/${id}`);
export const getEmployeeByUser = (uid) => api.get(`/employees/user/${uid}`);
export const createEmployee = (data) => api.post('/employees', data);
export const updateEmployee = (id, data) => api.put(`/employees/${id}`, data);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`);

// Cabs
export const getCabs = () => api.get('/cabs');
export const createCab = (data) => api.post('/cabs', data);
export const updateCab = (id, data) => api.put(`/cabs/${id}`, data);
export const deleteCab = (id) => api.delete(`/cabs/${id}`);

// Requests
export const getRequests = () => api.get('/requests');
export const getPendingRequests = () => api.get('/requests/pending');
export const getMyRequests = (empId) => api.get(`/requests/employee/${empId}`);
export const createRequest = (data) => api.post('/requests', data);
export const updateRequestStatus = (id, status) => api.put(`/requests/${id}/status`, { status });

// Routes
export const getRoutes = () => api.get('/routes');
export const getRoute = (id) => api.get(`/routes/${id}`);

// Optimize
export const runOptimization = () => api.post('/optimize/run');
export const getDemand = () => api.get('/optimize/demand');

// Admin stats
export const getStats = () => api.get('/admin/stats');

// Notifications
export const getNotifications = (uid) => api.get(`/notifications/user/${uid}`);
export const getUnreadCount = (uid) => api.get(`/notifications/user/${uid}/unread`);
export const markRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllRead = (uid) => api.put(`/notifications/user/${uid}/read-all`);

export default api;

// Tracking
export const getActiveCabs = () => api.get('/tracking/active');
export const getCabByRoute = (routeId) => api.get(`/tracking/route/${routeId}`);
export const getCabEta = (routeId, stopIndex) => api.get(`/tracking/route/${routeId}/eta/${stopIndex}`);
