import { useState } from 'react';

const TransferBookingForm = ({ selectedTransfer, onSubmit, onBack }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    holderName: '',
    holderSurname: '',
    holderEmail: '',
    holderPhone: '',
    pickupTime: '',
    comments: '',
  });
  const [errors, setErrors] = useState({});

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.holderName.trim()) newErrors.holderName = 'Name is required';
    if (!formData.holderSurname.trim()) newErrors.holderSurname = 'Surname is required';
    if (!formData.holderEmail.trim()) newErrors.holderEmail = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.holderEmail)) newErrors.holderEmail = 'Invalid email';
    if (!formData.holderPhone.trim()) newErrors.holderPhone = 'Phone is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.pickupTime) newErrors.pickupTime = 'Pickup time is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateStep3()) return;

    const bookingData = {
      language: 'en',
      holder: {
        name: formData.holderName,
        surname: formData.holderSurname,
        email: formData.holderEmail,
        phone: formData.holderPhone,
      },
      transfers: [
        {
          rateKey: selectedTransfer.rateKey,
          transferDetails: [
            {
              type: 'FLIGHT',
              direction: 'ARRIVAL',
              code: selectedTransfer.pickupInformation?.code || '',
              companyName: '',
              number: '',
              pickupTime: formData.pickupTime,
            },
          ],
        },
      ],
      clientReference: `REF-${Date.now()}`,
      remark: formData.comments,
    };
    onSubmit(bookingData);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Complete Booking</h2>
          <button onClick={onBack} className="text-blue-600 hover:underline">
            ← Back to Results
          </button>
        </div>
        <div className="flex gap-2 mb-6">
          <div className={`flex-1 h-2 rounded ${step >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`} />
          <div className={`flex-1 h-2 rounded ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
          <div className={`flex-1 h-2 rounded ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`} />
        </div>
      </div>

      {step === 1 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Transfer Details</h3>
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="font-medium">{selectedTransfer.category?.name}</p>
            <p className="text-gray-600">{selectedTransfer.vehicle?.name}</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              ${selectedTransfer.price?.totalAmount}
            </p>
          </div>
          <button
            onClick={() => setStep(2)}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
          >
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={(e) => { e.preventDefault(); if (validateStep2()) setStep(3); }}>
          <h3 className="text-xl font-semibold mb-4">Passenger Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">First Name *</label>
              <input
                type="text"
                name="holderName"
                value={formData.holderName}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.holderName && <p className="text-red-500 text-sm mt-1">{errors.holderName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Last Name *</label>
              <input
                type="text"
                name="holderSurname"
                value={formData.holderSurname}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.holderSurname && <p className="text-red-500 text-sm mt-1">{errors.holderSurname}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <input
                type="email"
                name="holderEmail"
                value={formData.holderEmail}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.holderEmail && <p className="text-red-500 text-sm mt-1">{errors.holderEmail}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone *</label>
              <input
                type="tel"
                name="holderPhone"
                value={formData.holderPhone}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.holderPhone && <p className="text-red-500 text-sm mt-1">{errors.holderPhone}</p>}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
            >
              Continue
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleSubmit}>
          <h3 className="text-xl font-semibold mb-4">Pickup Details</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Pickup Time *</label>
            <input
              type="time"
              name="pickupTime"
              value={formData.pickupTime}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.pickupTime && <p className="text-red-500 text-sm mt-1">{errors.pickupTime}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Special Requests</label>
            <textarea
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Any special requirements..."
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
            >
              Confirm Booking
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TransferBookingForm;
