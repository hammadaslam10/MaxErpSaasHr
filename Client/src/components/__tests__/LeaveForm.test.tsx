import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import LeaveForm from "../LeaveForm";
import authReducer from "@/redux/slices/authSlice";
import leaveReducer from "@/redux/slices/leaveSlice";

jest.mock("@/serverhook/leave", () => ({
  actionApplyLeave: jest.fn().mockResolvedValue({
    error: false,
    data: {
      id: "1",
      employeeId: "user-1",
      employeeName: "John Doe",
      employeeEmail: "john.doe@company.com",
      type: "ANNUAL",
      startDate: "2024-01-15",
      endDate: "2024-01-17",
      reason: "Test leave",
      status: "PENDING",
      appliedAt: "2024-01-10T10:00:00Z",
    },
    message: "Leave request submitted successfully",
  }),
}));

const createMockStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      leave: leaveReducer,
    },
  });
};

describe("LeaveForm", () => {
  it("renders leave form correctly", () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <LeaveForm />
      </Provider>
    );

    expect(screen.getByText("Apply for Leave")).toBeInTheDocument();
    expect(screen.getByLabelText("Leave Type")).toBeInTheDocument();
    expect(screen.getByLabelText("Start Date")).toBeInTheDocument();
    expect(screen.getByLabelText("End Date")).toBeInTheDocument();
    expect(screen.getByLabelText("Reason for Leave")).toBeInTheDocument();
  });

  it("validates required fields", async () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <LeaveForm />
      </Provider>
    );

    const submitButton = screen.getByText("Submit Leave Request");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Reason must be between 10 and 500 characters")
      ).toBeInTheDocument();
    });
  });

  it("submits form with valid data", async () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <LeaveForm />
      </Provider>
    );

    const reasonInput = screen.getByLabelText("Reason for Leave");
    const submitButton = screen.getByText("Submit Leave Request");

    fireEvent.change(reasonInput, {
      target: { value: "This is a valid reason for leave request" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Leave request submitted successfully!")
      ).toBeInTheDocument();
    });
  });
});
