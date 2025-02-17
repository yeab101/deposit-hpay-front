import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiClock, FiCheckCircle, FiXCircle, FiX, FiTrash2, FiEdit2 } from 'react-icons/fi';

function Deposits() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [verificationData, setVerificationData] = useState(null);
  const [verificationError, setVerificationError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDeposit, setEditingDeposit] = useState(null);
  const [newTransactionId, setNewTransactionId] = useState('');
  const [showVerificationConfirm, setShowVerificationConfirm] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState(null);

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/deposit-requests');
      if (!response.ok) {
        throw new Error('Failed to fetch deposits');
      }
      const data = await response.json();
      setDeposits(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDepositClick = (deposit) => {
    setSelectedDeposit(deposit);
    setShowVerificationConfirm(true);
  };

  const handleVerificationConfirm = async () => {
    setShowVerificationConfirm(false);
    setVerificationError(null);
    setVerificationData(null);
    setIsModalOpen(true);

    try {
      const response = await fetch('http://localhost:3000/api/verify/cbe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          txId: selectedDeposit.transactionId,
          chatId: selectedDeposit.chatId
        })
      });

      if (!response.ok) {
        throw new Error('Verification failed. Please try again.');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Verification failed. Please try again.');
      }

      setVerificationData(data);
    } catch (error) {
      setVerificationError(error.message);
      setVerificationData(null);
    }
  };
  const handleVerificationConfirmTelebirr = async () => {
    setShowVerificationConfirm(false);
    setVerificationError(null);
    setVerificationData(null);
    setIsModalOpen(true);

    try {
      const response = await fetch('http://localhost:3000/api/verify/telebirr/telebirr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          txId: selectedDeposit.transactionId,
          chatId: selectedDeposit.chatId
        })
      });

      if (!response.ok) {
        throw new Error('Verification failed. Please try again.');
      }

      const data = await response.json();

      console.log("data.data.receiverAccount.length", String(data.data.receiverAccount).length);
      console.log("data.data.receiverAccount", String(data.data.receiverAccount));
      
      if (String(data.data.receiverAccount).length < 5) {
        throw new Error('Verification failed: try again with telebirr-cbe button');
      }

      if (!data.success) {
        throw new Error(data.message || 'Verification failed. Please try again.');
      }

      setVerificationData(data);
    } catch (error) {
      setVerificationError(error.message);
      setVerificationData(null);
    }
  };
  const handleVerificationConfirmTelebirrToCbe = async () => {
    setShowVerificationConfirm(false);
    setVerificationError(null);
    setVerificationData(null);
    setIsModalOpen(true);

    try {
      const response = await fetch('http://localhost:3000/api/verify/telebirr/cbe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          txId: selectedDeposit.transactionId,
          chatId: selectedDeposit.chatId
        })
      });

      if (!response.ok) {
        throw new Error('Verification failed. Please try again.');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Verification failed. Please try again.');
      }

      setVerificationData(data);
    } catch (error) {
      setVerificationError(error.message);
      setVerificationData(null);
    }
  };

  const handleApprove = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/deposit-requests/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          depositId: verificationData.depositId,
          success: true,
          data: {
            payer: verificationData.data.payer,
            payerAccount: verificationData.data.payerAccount,
            receiver: verificationData.data.receiver,
            receiverAccount: verificationData.data.receiverAccount,
            paymentDate: verificationData.data.paymentDate,
            reference: verificationData.data.reference,
            transferredAmount: verificationData.data.transferredAmount
          },
          user: {
            chatId: verificationData.user.chatId,
            username: verificationData.user.username,
            phoneNumber: verificationData.user.phoneNumber,
            balance: verificationData.user.balance,
            txId: verificationData.user.txId
          }
        })
      });


      if (!response.ok) {
        throw new Error('Failed to approve deposit');
      }

      await fetchDeposits();
      setIsModalOpen(false);
    } catch (error) {
      setVerificationError(error.message);
    }
  };

  const handleReject = async (id, e) => {
    e.stopPropagation(); // Prevent modal from opening when clicking reject

    if (!window.confirm('Are you sure you want to reject this deposit request?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/deposit-requests/removerequest/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to reject deposit');
      }

      await fetchDeposits(); // Refresh the list
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();

    // Add confirmation dialog
    if (!window.confirm('Are you sure you want to update this transaction ID?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/deposit-requests/update-transaction`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          depositId: editingDeposit._id,
          newTransactionId: newTransactionId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update transaction ID');
      }

      await fetchDeposits();
      setIsEditModalOpen(false);
      setEditingDeposit(null);
      setNewTransactionId('');
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Deposit Requests</h2>
        <span className="text-gray-500">Total: {deposits.length}</span>
      </div>

      <div className="space-y-4">
        {deposits.map((deposit) => (
          <div
            key={deposit._id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer relative"

          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FiDollarSign className="text-green-500 text-xl" />
                <span className="font-medium">${deposit.amount}</span>
              </div>

              <div className="flex items-center space-x-4">
                {deposit.status === 'PENDING_APPROVAL' && (
                  <span className="flex items-center text-yellow-500">
                    <FiClock className="mr-1" />
                    Pending
                  </span>
                )}
                {deposit.status === 'APPROVED' && (
                  <span className="flex items-center text-green-500">
                    <FiCheckCircle className="mr-1" />
                    Approved
                  </span>
                )}
                {deposit.status === 'REJECTED' && (
                  <span className="flex items-center text-red-500">
                    <FiXCircle className="mr-1" />
                    Rejected
                  </span>
                )}
                <button
                  onClick={(e) => handleReject(deposit._id, e)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                  title="Reject Deposit"
                >
                  <FiTrash2 className="text-xl" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingDeposit(deposit);
                    setNewTransactionId(deposit.transactionId);
                    setIsEditModalOpen(true);
                  }}
                  className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
                  title="Edit Transaction ID"
                >
                  <FiEdit2 className="text-xl" />
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
              <div>
                <p className="font-semibold text-gray-700">Transaction Details</p>
                <p>Transaction ID: {deposit.transactionId}</p>
                <p>Chat ID: {deposit.chatId}</p>
                <p>Bank: {deposit.bank}</p>
              </div>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                onClick={() => handleDepositClick(deposit)}
              >
                Verify
              </button>

            </div>
          </div>
        ))}

        {deposits.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No deposit requests found
          </div>
        )}
      </div>

      {/* Add new Verification Confirmation Modal */}
      {showVerificationConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            {/* Add header with X button */}
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="text-lg font-semibold">Confirm Verification ID {selectedDeposit?.transactionId}</h3>
              <button
                onClick={() => {
                  setShowVerificationConfirm(false);
                  setSelectedDeposit(null);
                }}
                className="text-red-500 font-bold hover:text-red-700 hover:scale-150 transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to verify this deposit? 
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleVerificationConfirm}
                className="flex-1 bg-green-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Cbe-cbe
              </button>
              <button
                onClick={handleVerificationConfirmTelebirr}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Telebirr-telebirr
              </button>
              <button
                onClick={handleVerificationConfirmTelebirrToCbe}
                className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors"
              >
                Telebirr-cbe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-[90%] md:max-w-md max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">
                {verificationError ? 'Error' : 'Transaction Details'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500">
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 p-4">
              {verificationError ? (
                // Show error message
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <FiXCircle className="text-red-500 text-xl mr-2" />
                    <p className="text-red-700">{verificationError}</p>
                  </div>
                </div>
              ) : !verificationData ? (
                // Show loading spinner
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                // Show verification details
                <div className="space-y-3">
                  {/* Amount Card */}
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-green-700 text-sm font-semibold">Amount Transferred</p>
                    <p className="text-xl font-bold text-green-800">
                      ${verificationData.data.transferredAmount}
                    </p>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    {/* Receiver Information */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="text-sm font-semibold mb-2">Receiver Information</h4>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-600">
                          <span className="font-medium">Name:</span> {verificationData.data.receiver}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Account:</span> {verificationData.data.receiverAccount}
                        </p>
                      </div>
                    </div>

                    {/* Payer Information */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="text-sm font-semibold mb-2">Payer Information</h4>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-600">
                          <span className="font-medium">Name:</span> {verificationData.data.payer}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Account:</span> {verificationData.data.payerAccount}
                        </p>
                      </div>
                    </div>

                    {/* User Details */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="text-sm font-semibold mb-2">User Details</h4>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-600">
                          <span className="font-medium">Username:</span> {verificationData.user.username}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Phone:</span> {verificationData.user.phoneNumber}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Balance:</span> ${verificationData.user.balance}
                        </p>
                      </div>
                    </div>



                    {/* Additional Information */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="text-sm font-semibold mb-2">Additional Information</h4>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-600">
                          <span className="font-medium">Reference:</span> {verificationData.data.reference}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Date:</span> {new Date(verificationData.data.paymentDate).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer with Approve/Close buttons */}
            <div className="border-t p-4 flex gap-3">
              {!verificationError && verificationData && (
                <button
                  onClick={handleApprove}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg"
                >
                  Approve
                </button>
              )}
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Edit Transaction ID</h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingDeposit(null);
                  setNewTransactionId('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleEdit} className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction ID
                </label>
                <input
                  type="text"
                  value={newTransactionId}
                  onChange={(e) => setNewTransactionId(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingDeposit(null);
                    setNewTransactionId('');
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Deposits;