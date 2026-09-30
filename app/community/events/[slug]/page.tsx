// app/community/events/[slug]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import EventTshirtSponsor from '@/app/components/EventTshirtSponsor';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaUsers, 
  FaClock,
  FaArrowLeft,
  FaShare,
  FaHeart,
  FaRegHeart,
  FaSpinner,
  FaExclamationTriangle,
  FaTshirt,
  FaUser
} from 'react-icons/fa';

interface Event {
  id: number;
  slug: string;
  event_name: string;
  event_description: string;
  event_start_date: string;
  event_end_date: string;
  event_location: string;
  expected_footfalls: number;
  actual_footfalls: number;
  event_image: string | null;
  tshirt_front_image: string | null;
  tshirt_back_image: string | null;
  event_status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  is_published: boolean;
  club_name?: string;
  club_logo?: string;
  club_description?: string;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedImage, setSelectedImage] = useState<'event' | 'front' | 'back'>('event');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get current user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (params?.slug) {
      fetchEvent();
    }
  }, [params?.slug]);

  const fetchEvent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`Fetching event with slug: ${params.slug}`);
      const response = await fetch(`/api/events?slug=${params.slug}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Event not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Event data:', data);
      
      if (data.event) {
        setEvent(data.event);
      } else {
        throw new Error('Event data not found');
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch event');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <FaExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The event you are looking for does not exist.'}</p>
          <button
            onClick={() => router.push('/community/events')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
        >
          <FaArrowLeft className="w-4 h-4" />
          Back to Events
        </button>
      </div>

      {/* Event Header */}
      <div className="relative h-96 bg-gradient-to-r from-purple-600 to-blue-600">
        {event.event_image && (
          <Image
            src={event.event_image}
            alt={event.event_name}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-3xl">
            <div className="mb-4">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.event_status)}`}>
                {getStatusText(event.event_status)}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {event.event_name}
            </h1>
            <div className="flex flex-wrap gap-4 text-white">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="w-5 h-5" />
                <span>{formatDate(event.event_start_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaClock className="w-5 h-5" />
                <span>{formatTime(event.event_start_date)} - {formatTime(event.event_end_date)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">About This Event</h2>
              <div 
                className="text-gray-600 leading-relaxed prose max-w-none"
                dangerouslySetInnerHTML={{ __html: event.event_description || "No description available for this event." }}
              />
            </div>

            {/* T-Shirt Images Gallery */}
            {(event.tshirt_front_image || event.tshirt_back_image) && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">T-Shirt Designs</h2>
                
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => setSelectedImage('event')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      selectedImage === 'event'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FaCalendarAlt className="w-4 h-4" />
                    Event Banner
                  </button>
                  {event.tshirt_front_image && (
                    <button
                      onClick={() => setSelectedImage('front')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        selectedImage === 'front'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <FaTshirt className="w-4 h-4" />
                      Front View
                    </button>
                  )}
                  {event.tshirt_back_image && (
                    <button
                      onClick={() => setSelectedImage('back')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        selectedImage === 'back'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <FaTshirt className="w-4 h-4" />
                      Back View
                    </button>
                  )}
                </div>

                <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                  {selectedImage === 'event' && event.event_image && (
                    <div className="relative w-full h-96">
                      <Image
                        src={event.event_image}
                        alt={event.event_name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                  {selectedImage === 'front' && event.tshirt_front_image && (
                    <div className="relative w-full h-96">
                      <Image
                        src={event.tshirt_front_image}
                        alt="T-Shirt Front Design"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                  {selectedImage === 'back' && event.tshirt_back_image && (
                    <div className="relative w-full h-96">
                      <Image
                        src={event.tshirt_back_image}
                        alt="T-Shirt Back Design"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-500 mt-4 text-center">
                  High resolution designs - Perfect for printing
                </p>
              </div>
            )}

            {/* T-Shirt Sponsorship Section - Only show if event has t-shirt images and not completed */}
            {event.event_status !== 'completed' && (event.tshirt_front_image || event.tshirt_back_image) && (
              <EventTshirtSponsor
                eventSlug={event.slug}
                isLoggedIn={!!user}
                userId={user?.id}
                userName={user?.name}
                userEmail={user?.email}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Event Details</h3>
              
              <div className="space-y-4">
                {event.event_location && (
                  <div className="flex items-start gap-3">
                    <FaMapMarkerAlt className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-800">Location</p>
                      <p className="text-gray-600">{event.event_location}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-3">
                  <FaUsers className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800">Expected Attendance</p>
                    <p className="text-gray-600">{event.expected_footfalls.toLocaleString()}+ attendees</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FaCalendarAlt className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800">Date & Time</p>
                    <p className="text-gray-600">{formatDate(event.event_start_date)}</p>
                    <p className="text-gray-600">{formatTime(event.event_start_date)} - {formatTime(event.event_end_date)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={() => setIsSaved(!isSaved)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  {isSaved ? <FaHeart className="w-4 h-4 text-red-500" /> : <FaRegHeart className="w-4 h-4" />}
                  {isSaved ? 'Saved to Wishlist' : 'Save Event'}
                </button>

                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: event.event_name,
                        text: event.event_description,
                        url: window.location.href
                      }).catch(() => {});
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied to clipboard!');
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <FaShare className="w-4 h-4" />
                  Share Event
                </button>
              </div>
            </div>

            {event.club_name && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Organized By</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {event.club_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{event.club_name}</p>
                    <p className="text-sm text-gray-500">Event Organizer</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}