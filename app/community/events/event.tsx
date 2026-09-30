// app/community/events/event.tsx - Updated with better error handling
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaUsers, 
  FaSearch,
  FaFilter,
  FaTimes,
  FaClock,
  FaChevronLeft,
  FaChevronRight,
  FaSpinner,
  FaEye,
  FaExclamationTriangle
} from 'react-icons/fa';

interface Event {
  slug: any;
  id: number;
  event_name: string;
  event_description: string;
  event_start_date: string;
  event_end_date: string;
  event_location: string;
  expected_footfalls: number;
  event_image: string | null;
  event_status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  is_published: boolean;
  club_name?: string;
  club_logo?: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [locations, setLocations] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(9);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterAndSortEvents();
  }, [events, searchTerm, selectedStatus, selectedLocation]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching events from API...');
      const response = await fetch('/api/events');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      if (data.events && Array.isArray(data.events)) {
        setEvents(data.events);
        // Extract unique locations
        const uniqueLocations = [...new Set(data.events.map((event: Event) => event.event_location).filter(Boolean))];
        setLocations(uniqueLocations as string[]);
      } else if (data.events && !Array.isArray(data.events)) {
        console.error('Events is not an array:', data.events);
        setEvents([]);
        setError('Invalid data format received');
      } else {
        setEvents([]);
        if (data.error) {
          setError(data.error);
        }
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch events');
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortEvents = () => {
    let filtered = [...events];

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(event => event.event_status === selectedStatus);
    }

    // Filter by location
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(event => event.event_location === selectedLocation);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(event => 
        event.event_name.toLowerCase().includes(term) ||
        event.event_description?.toLowerCase().includes(term) ||
        event.event_location?.toLowerCase().includes(term)
      );
    }

    // Sort events: upcoming first, then ongoing, then completed
    filtered.sort((a, b) => {
      const statusOrder = { upcoming: 1, ongoing: 2, completed: 3, cancelled: 4 };
      const statusDiff = (statusOrder[a.event_status] || 0) - (statusOrder[b.event_status] || 0);
      
      if (statusDiff !== 0) return statusDiff;
      
      // If same status, sort by start date (nearest first)
      return new Date(a.event_start_date).getTime() - new Date(b.event_start_date).getTime();
    });

    setFilteredEvents(filtered);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSelectedLocation('all');
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      upcoming: 'bg-blue-100 text-blue-800',
      ongoing: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Pagination
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <FaExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Error Loading Events</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchEvents}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 py-16">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Upcoming Events
          </h1>
          <p className="text-xl text-white text-opacity-90 max-w-2xl mx-auto">
            Discover and join exciting events from clubs and communities
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search events by name, description, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle Button (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 rounded-lg"
            >
              <FaFilter />
              Filters
              {(selectedStatus !== 'all' || selectedLocation !== 'all') && (
                <span className="bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {Number(selectedStatus !== 'all') + Number(selectedLocation !== 'all')}
                </span>
              )}
            </button>

            {/* Desktop Filters */}
            <div className="hidden lg:flex gap-4">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Locations</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>

              {(searchTerm || selectedStatus !== 'all' || selectedLocation !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Mobile Filters Panel */}
          {showFilters && (
            <div className="lg:hidden mt-4 pt-4 border-t space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">All Locations</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Found <span className="font-semibold text-gray-900">{filteredEvents.length}</span> events
          </p>
        </div>

        {/* Events Grid */}
        {currentEvents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <FaCalendarAlt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedStatus !== 'all' || selectedLocation !== 'all'
                ? "Try adjusting your filters or search term"
                : "Check back later for upcoming events"}
            </p>
            {(searchTerm || selectedStatus !== 'all' || selectedLocation !== 'all') && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentEvents.map((event) => (
                <div key={event.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
                  {/* Event Image */}
                  <div className="relative h-48 bg-gray-200">
                    {event.event_image ? (
                      <Image
                        src={event.event_image}
                        alt={event.event_name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
                        <FaCalendarAlt className="w-12 h-12 text-purple-400" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(event.event_status)}`}>
                        {getStatusText(event.event_status)}
                      </span>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
                      {event.event_name}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {event.event_description || "No description available"}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <FaCalendarAlt className="w-4 h-4 flex-shrink-0" />
                        <span>
                          {formatDate(event.event_start_date)}
                          {formatDate(event.event_start_date) !== formatDate(event.event_end_date) && 
                            ` - ${formatDate(event.event_end_date)}`
                          }
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <FaClock className="w-4 h-4 flex-shrink-0" />
                        <span>
                          {formatTime(event.event_start_date)} - {formatTime(event.event_end_date)}
                        </span>
                      </div>
                      
                      {event.event_location && (
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <FaMapMarkerAlt className="w-4 h-4 flex-shrink-0" />
                          <span className="line-clamp-1">{event.event_location}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <FaUsers className="w-4 h-4 flex-shrink-0" />
                        <span>Expected: {event.expected_footfalls}+ attendees</span>
                      </div>
                    </div>

                    <Link
  href={`/community/events/${event.slug}`}  // Changed from /events/ to /community/events/
  className="inline-flex items-center justify-center w-full gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
>
  <FaEye className="w-4 h-4" />
  View Details
</Link>
                                    </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <FaChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="flex gap-2">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => paginate(pageNum)}
                        className={`w-10 h-10 rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-purple-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <FaChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}