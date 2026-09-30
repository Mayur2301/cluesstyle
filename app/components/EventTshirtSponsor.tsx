// app/components/EventTshirtSponsor.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Script from 'next/script';
import { 
  FaRupeeSign, 
  FaCheckCircle, 
  FaLock, 
  FaMapMarkerAlt, 
  FaSpinner,
  FaCreditCard,
  FaRegCheckCircle
} from 'react-icons/fa';

interface Position {
  position_key: string;
  position_name: string;
  description: string;
  base_price: number;
  is_booked: boolean;
  sponsor_name: string | null;
  sponsor_logo: string | null;
  coordinates: { x: number; y: number };
  logo_shape: 'circular' | 'rectangular';
  logo_width: number;
  logo_height: number;
  enabled: boolean;
}

interface EventTshirtSponsorProps {
  eventSlug: string;
  isLoggedIn: boolean;
  userId?: number;
  userName?: string;
  userEmail?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function EventTshirtSponsor({ 
  eventSlug, 
  isLoggedIn, 
  userId, 
  userName, 
  userEmail 
}: EventTshirtSponsorProps) {
  const [eventData, setEventData] = useState<any>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);
  const [uploadedLogoPreview, setUploadedLogoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (eventSlug) {
      fetchSponsorshipData();
    }
  }, [eventSlug, refreshTrigger]);

  const fetchSponsorshipData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/events/${eventSlug}/sponsorship`);
      const data = await response.json();
      if (data.success) {
        setEventData(data.event);
        setPositions(data.positions);
      }
    } catch (error) {
      console.error('Error fetching sponsorship data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePositionClick = (position: Position) => {
    if (position.is_booked) {
      alert(`This position is already booked by ${position.sponsor_name}`);
      return;
    }
    if (!position.enabled) {
      alert('This position is not available for sponsorship');
      return;
    }
    setSelectedPosition(position);
    setShowBookingModal(true);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  console.log('Starting logo upload...', { fileName: file.name, fileSize: file.size, fileType: file.type });

  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!validTypes.includes(file.type)) {
    alert('Please upload JPEG, PNG, or WebP images only.');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('File size must be less than 5MB');
    return;
  }

  const previewUrl = URL.createObjectURL(file);
  setUploadedLogoPreview(previewUrl);
  setUploadingLogo(true);

  const formData = new FormData();
  formData.append('image', file);
  formData.append('type', 'sponsor_logo');

  try {
    console.log('Sending upload request to /api/upload');
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    console.log('Upload response:', data);
    
    if (response.ok && data.url) {
      setUploadedLogo(data.url);
      console.log('Logo uploaded successfully, URL:', data.url);
    } else {
      throw new Error(data.error || 'Upload failed');
    }
  } catch (error) {
    console.error('Error uploading logo:', error);
    alert('Failed to upload logo. Please try again.');
    setUploadedLogoPreview(null);
  } finally {
    setUploadingLogo(false);
  }
};

  const createBooking = async () => {
    try {
      const response = await fetch('/api/sponsorships/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventData?.id,
          position_key: selectedPosition?.position_key,
          sponsor_id: userId,
          sponsor_name: userName,
          sponsor_email: userEmail,
          sponsor_logo: uploadedLogo,
          amount: selectedPosition?.base_price,
          logo_shape: selectedPosition?.logo_shape,
          logo_dimensions: {
            width: selectedPosition?.logo_width,
            height: selectedPosition?.logo_height
          }
        }),
      });

      const data = await response.json();
      if (data.success) {
        setBookingId(data.sponsorship_id);
        return data.sponsorship_id;
      } else {
        throw new Error(data.error || 'Booking failed');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  };

  const initiatePayment = async (sponsorshipId: number) => {
    try {
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sponsorship_id: sponsorshipId,
          amount: selectedPosition?.base_price,
          position_name: selectedPosition?.position_name,
          event_id: eventData?.id,
          sponsor_id: userId
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create order');
      }

      return data;
    } catch (error) {
      console.error('Error creating payment order:', error);
      throw error;
    }
  };

  const verifyPayment = async (
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    sponsorshipId: number
  ) => {
    try {
      const response = await fetch('/api/payments/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: razorpaySignature,
          sponsorship_id: sponsorshipId
        }),
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error verifying payment:', error);
      return false;
    }
  };

  const handlePayment = async () => {
    if (!isLoggedIn) {
      alert('Please login to sponsor this position');
      window.location.href = '/account';
      return;
    }

    if (!uploadedLogo) {
      alert('Please upload your logo');
      return;
    }

    if (!window.Razorpay) {
      alert('Payment system is loading. Please try again.');
      return;
    }

    setPaymentProcessing(true);

    try {
      const sponsorshipId = await createBooking();
      const orderData = await initiatePayment(sponsorshipId);
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'CluesStyle',
        description: `Sponsorship: ${selectedPosition?.position_name} position`,
        image: '/logo.png',
        order_id: orderData.orderId,
        prefill: {
          name: userName || '',
          email: userEmail || '',
          contact: '',
        },
        theme: {
          color: '#7c3aed',
        },
        modal: {
          ondismiss: () => {
            setPaymentProcessing(false);
            alert('Payment cancelled');
          },
        },
        handler: async (response: any) => {
          const verified = await verifyPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
            sponsorshipId
          );

          if (verified) {
            alert('Payment successful! Your logo has been placed on the t-shirt.');
            setShowBookingModal(false);
            setUploadedLogo(null);
            setUploadedLogoPreview(null);
            setBookingId(null);
            // Refresh the positions to show the newly booked logo
            setRefreshTrigger(prev => prev + 1);
          } else {
            alert('Payment verification failed. Please contact support.');
          }
          setPaymentProcessing(false);
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
      setPaymentProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <FaSpinner className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading sponsorship options...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!eventData || positions.length === 0) {
    return null;
  }

  const availablePositions = positions.filter(p => p.enabled);
  if (availablePositions.length === 0) {
    return null;
  }

  return (
    <>
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js" 
        strategy="lazyOnload"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => console.error('Failed to load Razorpay script')}
      />

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Sponsor This Event</h2>
        <p className="text-gray-600 mb-6">
          Book a logo space on the event t-shirt. Your logo will be printed and visible to all attendees!
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Front View */}
          {eventData.tshirt_front && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2 text-center">Front View</p>
              <div className="relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                <div className="relative w-full aspect-[3/4]">
                  <Image
                    src={eventData.tshirt_front}
                    alt="Event T-Shirt Front"
                    fill
                    className="object-contain"
                  />
                  {positions.filter(p => p.position_key !== 'back' && p.enabled).map((position) => (
                    <button
                      key={position.position_key}
                      onClick={() => handlePositionClick(position)}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 group transition-all hover:scale-105 ${
                        position.is_booked ? 'cursor-default' : 'cursor-pointer'
                      }`}
                      style={{ 
                        top: `${position.coordinates.y}%`, 
                        left: `${position.coordinates.x}%`,
                        width: `${position.logo_width}px`,
                        height: `${position.logo_height}px`,
                        marginLeft: `-${position.logo_width / 2}px`,
                        marginTop: `-${position.logo_height / 2}px`
                      }}
                      disabled={position.is_booked}
                    >
                      {position.is_booked && position.sponsor_logo ? (
                        <div 
                          className={`relative w-full h-full overflow-hidden border-2 border-green-500 bg-white shadow-lg transition-all hover:scale-105 ${
                            position.logo_shape === 'circular' ? 'rounded-full' : 'rounded-lg'
                          }`}
                        >
                          <Image
                            src={position.sponsor_logo}
                            alt={position.sponsor_name || 'Sponsor'}
                            fill
                            className="object-contain p-1"
                          />
                          {/* Tooltip on hover */}
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            {position.sponsor_name}
                          </div>
                          <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                            <FaRegCheckCircle className="text-green-600 text-lg" />
                          </div>
                        </div>
                      ) : (
                        <div 
                          className={`w-full h-full bg-purple-600 bg-opacity-80 hover:bg-opacity-100 transition-all flex flex-col items-center justify-center gap-1 ${
                            position.logo_shape === 'circular' ? 'rounded-full' : 'rounded-lg'
                          }`}
                        >
                          <FaMapMarkerAlt className="w-5 h-5 text-white" />
                          <span className="text-xs text-white font-medium">₹{position.base_price}</span>
                          <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-medium text-gray-700 bg-white px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            {position.position_name}
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Back View */}
          {eventData.tshirt_back && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2 text-center">Back View</p>
              <div className="relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                <div className="relative w-full aspect-[3/4]">
                  <Image
                    src={eventData.tshirt_back}
                    alt="Event T-Shirt Back"
                    fill
                    className="object-contain"
                  />
                  {positions.filter(p => p.position_key === 'back' && p.enabled).map((position) => (
                    <button
                      key={position.position_key}
                      onClick={() => handlePositionClick(position)}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 group transition-all hover:scale-105 ${
                        position.is_booked ? 'cursor-default' : 'cursor-pointer'
                      }`}
                      style={{ 
                        top: `${position.coordinates.y}%`, 
                        left: `${position.coordinates.x}%`,
                        width: `${position.logo_width}px`,
                        height: `${position.logo_height}px`,
                        marginLeft: `-${position.logo_width / 2}px`,
                        marginTop: `-${position.logo_height / 2}px`
                      }}
                      disabled={position.is_booked}
                    >
                      {position.is_booked && position.sponsor_logo ? (
                        <div 
                          className={`relative w-full h-full overflow-hidden border-2 border-green-500 bg-white shadow-lg transition-all hover:scale-105 ${
                            position.logo_shape === 'circular' ? 'rounded-full' : 'rounded-lg'
                          }`}
                        >
                          <Image
                            src={position.sponsor_logo}
                            alt={position.sponsor_name || 'Sponsor'}
                            fill
                            className="object-contain p-1"
                          />
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            {position.sponsor_name}
                          </div>
                          <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                            <FaRegCheckCircle className="text-green-600 text-xl" />
                          </div>
                        </div>
                      ) : (
                        <div 
                          className={`w-full h-full bg-purple-600 bg-opacity-80 hover:bg-opacity-100 transition-all flex flex-col items-center justify-center gap-1 ${
                            position.logo_shape === 'circular' ? 'rounded-full' : 'rounded-lg'
                          }`}
                        >
                          <FaMapMarkerAlt className="w-6 h-6 text-white" />
                          <span className="text-sm text-white font-medium">₹{position.base_price}</span>
                          <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-medium text-gray-700 bg-white px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            {position.position_name}
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Available Positions List */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Sponsorship Slots</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {positions.filter(p => p.enabled).map((position) => (
              <div
                key={position.position_key}
                className={`border rounded-lg p-4 transition-all ${
                  position.is_booked 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-white border-purple-200 hover:shadow-md hover:border-purple-300 cursor-pointer'
                }`}
                onClick={() => !position.is_booked && handlePositionClick(position)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-800">{position.position_name}</h4>
                  {position.is_booked ? (
                    <FaCheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <span className="text-purple-600 font-bold flex items-center">
                      <FaRupeeSign className="w-3 h-3" />{position.base_price}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  {position.logo_shape === 'circular' ? '● Circular logo' : '◻️ Rectangular logo'}
                  <br />
                  ({position.logo_width}x{position.logo_height}px)
                </p>
                {position.is_booked ? (
                  <div className="flex items-center gap-2 mt-2">
                    {position.sponsor_logo && (
                      <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-100">
                        <Image
                          src={position.sponsor_logo}
                          alt={position.sponsor_name || 'Sponsor'}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                    <p className="text-xs text-green-600 truncate flex-1">Booked by {position.sponsor_name}</p>
                  </div>
                ) : (
                  <button
                    onClick={() => handlePositionClick(position)}
                    className="w-full mt-2 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Book Now
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Booking Modal */}
        {showBookingModal && selectedPosition && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Book {selectedPosition.position_name} Position</h3>
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setUploadedLogo(null);
                    setUploadedLogoPreview(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Sponsorship Amount</p>
                  <p className="text-2xl font-bold text-purple-600">₹{selectedPosition.base_price}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Logo will be placed as {selectedPosition.logo_shape === 'circular' ? 'circular' : 'rectangular'} 
                    ({selectedPosition.logo_width}x{selectedPosition.logo_height}px)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Your Logo *
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleLogoUpload}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    High resolution logo recommended. Will be resized to fit the area.
                  </p>
                </div>

                {uploadingLogo && (
                  <div className="flex justify-center items-center py-4">
                    <FaSpinner className="w-6 h-6 text-purple-600 animate-spin" />
                    <span className="ml-2 text-sm text-gray-500">Uploading...</span>
                  </div>
                )}

                {uploadedLogoPreview && (
                  <div className="flex justify-center">
                    <div 
                      className={`relative w-32 h-32 overflow-hidden border-2 border-purple-300 bg-gray-50 ${
                        selectedPosition.logo_shape === 'circular' ? 'rounded-full' : 'rounded-lg'
                      }`}
                    >
                      <Image
                        src={uploadedLogoPreview}
                        alt="Logo preview"
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handlePayment}
                    disabled={paymentProcessing || !uploadedLogo || uploadingLogo}
                    className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {paymentProcessing ? (
                      <>
                        <FaSpinner className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaCreditCard className="w-4 h-4" />
                        Pay ₹{selectedPosition.base_price}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowBookingModal(false);
                      setUploadedLogo(null);
                      setUploadedLogoPreview(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}