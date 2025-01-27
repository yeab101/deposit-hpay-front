import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';

function Deposits() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleDepositClick = async (deposit) => {
    try {
      const response = await fetch('http://localhost:3000/api/verify/cbe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: deposit.url,
          chatId: deposit.chatId
        })
      });

      const data = await response.json();
      console.log('Verification response:', data);

    } catch (error) {
      console.error('Verification error:', error);
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
            className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleDepositClick(deposit)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FiDollarSign className="text-green-500 text-xl" />
                <span className="font-medium">${deposit.amount}</span>
              </div>
              
              <div className="flex items-center space-x-2">
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
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
              <div>
                <p className="font-semibold text-gray-700">Transaction Details</p>
                <p>Transaction ID: {deposit.transactionId}</p>
                <p>Chat ID: {deposit.chatId}</p> 
              </div>
              
              <div>
                <p className="font-semibold text-gray-700">Payment Info</p>
                <p>Account: {deposit.paymentMethod}</p> 
                <p>URL: {deposit.url}</p>
              </div>
              
         
            </div>
          </div>
        ))}

        {deposits.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No deposit requests found
          </div>
        )}
      </div>
    </div>
  );
}

export default Deposits;