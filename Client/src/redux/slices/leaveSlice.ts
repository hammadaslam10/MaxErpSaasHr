import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LeaveRequest, CreateLeaveRequestDto, UpdateLeaveRequestDto } from '@/types';

interface LeaveState {
  requests: LeaveRequest[];
  pendingRequests: LeaveRequest[];
  loading: boolean;
  error: string | null;
}

const initialState: LeaveState = {
  requests: [],
  pendingRequests: [],
  loading: false,
  error: null,
};

const leaveSlice = createSlice({
  name: 'leave',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    addRequest(state, action: PayloadAction<LeaveRequest>) {
      state.requests.unshift(action.payload);
      if (action.payload.status === 'PENDING') {
        state.pendingRequests.unshift(action.payload);
      }
    },
    updateRequest(state, action: PayloadAction<LeaveRequest>) {
      const index = state.requests.findIndex(req => req.id === action.payload.id);
      if (index !== -1) {
        state.requests[index] = action.payload;
      }
      
      
      const pendingIndex = state.pendingRequests.findIndex(req => req.id === action.payload.id);
      if (pendingIndex !== -1) {
        if (action.payload.status !== 'PENDING') {
          state.pendingRequests.splice(pendingIndex, 1);
        } else {
          state.pendingRequests[pendingIndex] = action.payload;
        }
      }
    },
    removeRequest(state, action: PayloadAction<string>) {
      state.requests = state.requests.filter(req => req.id !== action.payload);
      state.pendingRequests = state.pendingRequests.filter(req => req.id !== action.payload);
    },
    setPendingRequests(state, action: PayloadAction<LeaveRequest[]>) {
      state.pendingRequests = action.payload;
    },
    setRequests(state, action: PayloadAction<LeaveRequest[]>) {
      state.requests = action.payload;
    },
  },
});

export const { 
  setLoading, 
  setError, 
  clearError, 
  addRequest, 
  updateRequest, 
  removeRequest, 
  setPendingRequests,
  setRequests 
} = leaveSlice.actions;
export default leaveSlice.reducer;