import api from '../utils/api';

const reimbursementService = {
    apply: async (data) => {
        const response = await api.post('/reimbursements', data);
        return response.data;
    },
    getMyReimbursements: async () => {
        const response = await api.get('/reimbursements/my');
        return response.data;
    },
    getPending: async () => {
        const response = await api.get('/reimbursements/pending');
        return response.data;
    },
    review: async (id, data) => {
        const response = await api.put(`/reimbursements/${id}/review`, data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/reimbursements/${id}`, data);
        return response.data;
    },
    getAll: async () => {
        const response = await api.get('/reimbursements/all');
        return response.data;
    }
};

export default reimbursementService;
