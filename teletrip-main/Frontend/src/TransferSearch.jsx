import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TransferResults from './components/transfers/TransferResults';
import Header from './components/Header';

const TransferSearch = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedResults = sessionStorage.getItem('transferResults');
    if (savedResults) {
      setResults(JSON.parse(savedResults));
    }
  }, []);

  const handleSelectTransfer = (transfer) => {
    const searchParams = JSON.parse(sessionStorage.getItem('transferSearch') || '{}');
    const cartItem = {
      type: 'transfer',
      ...transfer,
      fromCode: searchParams.fromCode,
      toCode: searchParams.toCode,
      fromType: searchParams.fromType,
      toType: searchParams.toType,
      pickupDate: searchParams.outbound,
      pickupTime: new Date(searchParams.outbound).toTimeString().slice(0, 5),
      adults: searchParams.adults,
      children: searchParams.children,
      infants: searchParams.infants
    };
    
    navigate('/checkout', {
      state: {
        cartItems: [cartItem],
        totalAmount: transfer.price?.amount
      }
    });
  };



  return (
    <>
      <Header />
      <div className="pt-20 min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <button
              onClick={() => navigate('/home')}
              className="text-blue-600 hover:underline flex items-center gap-2"
            >
              ← Back to Search
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <TransferResults
            results={results?.transfers || []}
            onSelect={handleSelectTransfer}
            loading={loading}
          />
        </div>
      </div>
    </>
  );
};

export default TransferSearch;
