// app/dashboard/club/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaUsers, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaPlus,
  FaTimes,
  FaChartLine,
  FaClock,
  FaCheckCircle,
  FaSpinner,
  FaSave,
  FaBan,
  FaTshirt,
  FaCamera,
  FaCheck,
  FaMapMarker,
  FaCrosshairs
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
  position_coordinates: string | null;
  event_status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  is_published: boolean;
  created_at: string;
}

interface ClubProfile {
  club_name: string;
  club_logo: string | null;
  club_banner: string | null;
  club_description: string;
  total_events: number;
  total_footfalls: number;
}

interface ImageValidation {
  isValid: boolean;
  error?: string;
  width?: number;
  height?: number;
  size?: number;
}

interface PositionCoordinates {
  left_chest: { x: number; y: number };
  right_chest: { x: number; y: number };
  center: { x: number; y: number };
  back: { x: number; y: number };
}

interface PositionConfig {
  left_chest: {
    enabled: boolean;
    x: number;
    y: number;
    shape: 'circular' | 'rectangular';
    width: number;
    height: number;
    price: number;
  };
  right_chest: {
    enabled: boolean;
    x: number;
    y: number;
    shape: 'circular' | 'rectangular';
    width: number;
    height: number;
    price: number;
  };
  center: {
    enabled: boolean;
    x: number;
    y: number;
    shape: 'circular' | 'rectangular';
    width: number;
    height: number;
    price: number;
  };
  back: {
    enabled: boolean;
    x: number;
    y: number;
    shape: 'circular' | 'rectangular';
    width: number;
    height: number;
    price: number;
  };
}

const defaultPositionConfig: PositionConfig = {
  left_chest: {
    enabled: true,
    x: 22,
    y: 28,
    shape: 'circular',
    width: 60,
    height: 60,
    price: 1200
  },
  right_chest: {
    enabled: true,
    x: 58,
    y: 28,
    shape: 'circular',
    width: 60,
    height: 60,
    price: 1200
  },
  center: {
    enabled: true,
    x: 40,
    y: 55,
    shape: 'rectangular',
    width: 120,
    height: 80,
    price: 2000
  },
  back: {
    enabled: true,
    x: 40,
    y: 35,
    shape: 'rectangular',
    width: 200,
    height: 150,
    price: 2500
  }
};

export default function ClubDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<ClubProfile | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState<'events' | 'stats'>('events');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Form state with 3 images
  const [formData, setFormData] = useState({
    event_name: '',
    slug: '', 
    event_description: '',
    event_start_date: '',
    event_end_date: '',
    event_location: '',
    expected_footfalls: 0,
    event_image: '',
    tshirt_front_image: '',
    tshirt_back_image: '',
    is_published: false
  });
  
  // Position coordinates state
  const [positionCoordinates, setPositionCoordinates] = useState<PositionCoordinates>({
    left_chest: { x: 22, y: 28 },
    right_chest: { x: 58, y: 28 },
    center: { x: 40, y: 55 },
    back: { x: 40, y: 35 }
  });
  
  // Position configuration state - MOVED INSIDE the component
  const [positionConfig, setPositionConfig] = useState<PositionConfig>(defaultPositionConfig);
  const [selectedConfigPosition, setSelectedConfigPosition] = useState<string>('left_chest');
  
  const [selectedPosition, setSelectedPosition] = useState<string>('left_chest');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showPositionCustomizer, setShowPositionCustomizer] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<'event' | 'front' | 'back' | null>(null);
  
  // Image validation states
  const [imageErrors, setImageErrors] = useState({
    event: '',
    front: '',
    back: ''
  });

  // Image preview refs
  const [imagePreviews, setImagePreviews] = useState({
    event: '',
    front: '',
    back: ''
  });

  // Add these functions INSIDE the component
  const updatePositionConfig = (position: string, field: string, value: any) => {
    setPositionConfig(prev => ({
      ...prev,
      [position]: {
        ...prev[position as keyof PositionConfig],
        [field]: value
      }
    }));
  };

  const togglePositionEnabled = (position: string) => {
    setPositionConfig(prev => ({
      ...prev,
      [position]: {
        ...prev[position as keyof PositionConfig],
        enabled: !prev[position as keyof PositionConfig].enabled
      }
    }));
  };

  const savePositionConfiguration = async (eventId: number, config: PositionConfig) => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch('/api/club/update-position-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-email': user.email
        },
        body: JSON.stringify({
          event_id: eventId,
          position_config: config
        })
      });
      
      if (response.ok) {
        alert('Position configuration saved successfully!');
      } else {
        alert('Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving position config:', error);
      alert('Error saving configuration');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const userType = localStorage.getItem('userType');
    
    if (!token || userType !== 'club') {
      router.push('/account');
      return;
    }
    
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    fetchClubData();
  }, []);

  const fetchClubData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([fetchEvents(), fetchClubProfile()]);
    } catch (error) {
      console.error('Error fetching club data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to generate slug from event name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Handle event name change and auto-generate slug
  const handleEventNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = generateSlug(name);
    setFormData({ 
      ...formData, 
      event_name: name,
      slug: slug 
    });
  };

  const fetchEvents = async (status?: string) => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const url = status && status !== 'all' 
        ? `/api/club/events?status=${status}`
        : '/api/club/events';
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-user-email': user.email
        }
      });
      const data = await response.json();
      if (data.events) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchClubProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch('/api/club/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-user-email': user.email
        }
      });
      const data = await response.json();
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Validate image dimensions and quality
  const validateImage = (file: File, type: 'event' | 'front' | 'back'): Promise<ImageValidation> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        
        const validation: ImageValidation = { isValid: true };
        
        if (type === 'event') {
          if (img.width < 800 || img.height < 400) {
            validation.isValid = false;
            validation.error = `Event image must be at least 800x400 pixels. Current: ${img.width}x${img.height}`;
          } else if (img.width > 4000 || img.height > 4000) {
            validation.isValid = false;
            validation.error = 'Image dimensions are too large. Maximum 4000x4000 pixels.';
          } else {
            validation.width = img.width;
            validation.height = img.height;
          }
        } else {
          if (img.width < 1500 || img.height < 1500) {
            validation.isValid = false;
            validation.error = `T-shirt image must be at least 1500x1500 pixels for HD quality. Current: ${img.width}x${img.height}`;
          } else if (img.width > 5000 || img.height > 5000) {
            validation.isValid = false;
            validation.error = 'Image dimensions are too large. Maximum 5000x5000 pixels.';
          } else if (img.width !== img.height) {
            validation.isValid = false;
            validation.error = 'T-shirt images should be square (equal width and height) for best results.';
          } else {
            validation.width = img.width;
            validation.height = img.height;
          }
        }
        
        if (type !== 'event' && validation.isValid) {
          const aspectRatio = img.width / img.height;
          if (Math.abs(aspectRatio - 1) > 0.1) {
            validation.isValid = false;
            validation.error = 'T-shirt images should be square (1:1 aspect ratio).';
          }
        }
        
        resolve(validation);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({ isValid: false, error: 'Failed to load image. Please try again.' });
      };
      
      img.src = objectUrl;
    });
  };

  // Upload image with validation
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'event' | 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setImageErrors(prev => ({ ...prev, [type]: 'Please upload JPEG, PNG, or WebP images only.' }));
      return;
    }

    const maxSize = type === 'event' ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setImageErrors(prev => ({ ...prev, [type]: `Image size must be less than ${maxSize / (1024 * 1024)}MB. Current: ${(file.size / (1024 * 1024)).toFixed(2)}MB` }));
      return;
    }

    setUploadingImage(type);
    setImageErrors(prev => ({ ...prev, [type]: '' }));

    const previewUrl = URL.createObjectURL(file);
    setImagePreviews(prev => ({ ...prev, [type]: previewUrl }));

    const uploadFormData = new FormData();
    uploadFormData.append('image', file);
    uploadFormData.append('type', type);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      if (data.url) {
        const fieldName = type === 'event' ? 'event_image' : 
                         type === 'front' ? 'tshirt_front_image' : 'tshirt_back_image';
        
        setFormData(prev => ({ 
          ...prev, 
          [fieldName]: data.url 
        }));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setImageErrors(prev => ({ ...prev, [type]: 'Failed to upload image. Please try again.' }));
      setImagePreviews(prev => ({ ...prev, [type]: '' }));
    } finally {
      setUploadingImage(null);
    }
  };

  // Handle position coordinate change
  const handleCoordinateChange = (axis: 'x' | 'y', value: number) => {
    setPositionCoordinates(prev => ({
      ...prev,
      [selectedPosition]: {
        ...prev[selectedPosition as keyof PositionCoordinates],
        [axis]: value
      }
    }));
  };

  // Handle mouse/touch drag for position markers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, positionKey: string) => {
    setSelectedPosition(positionKey);
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX, y: clientY });
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent, containerRef: HTMLDivElement | null) => {
    if (!isDragging || !containerRef) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const rect = containerRef.getBoundingClientRect();
    const deltaX = clientX - dragStart.x;
    const deltaY = clientY - dragStart.y;
    
    const currentCoords = positionCoordinates[selectedPosition as keyof PositionCoordinates];
    const newX = Math.min(100, Math.max(0, currentCoords.x + (deltaX / rect.width) * 100));
    const newY = Math.min(100, Math.max(0, currentCoords.y + (deltaY / rect.height) * 100));
    
    setPositionCoordinates(prev => ({
      ...prev,
      [selectedPosition]: { x: newX, y: newY }
    }));
    
    setDragStart({ x: clientX, y: clientY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Save position coordinates to database
  const savePositionCoordinates = async () => {
    if (!editingEvent && !formData.event_name) {
      alert('Please save the event first before customizing positions');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const eventId = editingEvent?.id;
      if (!eventId) {
        alert('Please save the event first');
        return;
      }
      
      const response = await fetch('/api/club/update-position-coordinates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-email': user.email
        },
        body: JSON.stringify({
          event_id: eventId,
          coordinates: positionCoordinates
        })
      });
      
      if (response.ok) {
        alert('Position coordinates saved successfully!');
      } else {
        alert('Failed to save coordinates');
      }
    } catch (error) {
      console.error('Error saving coordinates:', error);
      alert('Error saving coordinates');
    }
  };

  // Load position coordinates when editing event
  useEffect(() => {
    if (editingEvent && editingEvent.position_coordinates) {
      try {
        const savedCoords = JSON.parse(editingEvent.position_coordinates);
        setPositionCoordinates(prev => ({
          ...prev,
          ...savedCoords
        }));
      } catch (e) {
        console.error('Error parsing position coordinates:', e);
      }
    }
  }, [editingEvent]);

  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.event_image) {
      alert('Please upload an event image.');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const url = editingEvent 
        ? `/api/club/events/${editingEvent.id}`
        : '/api/club/events';
      
      const method = editingEvent ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-email': user.email
        },
        body: JSON.stringify({
          ...formData,
          position_coordinates: JSON.stringify(positionCoordinates)
        }),
      });

      if (response.ok) {
        await fetchEvents(filterStatus);
        setShowEventForm(false);
        setEditingEvent(null);
        setFormData({
          event_name: '',
          slug: '',
          event_description: '',
          event_start_date: '',
          event_end_date: '',
          event_location: '',
          expected_footfalls: 0,
          event_image: '',
          tshirt_front_image: '',
          tshirt_back_image: '',
          is_published: false
        });
        setImagePreviews({ event: '', front: '', back: '' });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save event');
      }
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(`/api/club/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-user-email': user.email
        }
      });
      
      if (response.ok) {
        await fetchEvents(filterStatus);
      } else {
        alert('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      event_name: event.event_name,
      slug: event.slug || generateSlug(event.event_name),
      event_description: event.event_description || '',
      event_start_date: event.event_start_date.slice(0, 16),
      event_end_date: event.event_end_date.slice(0, 16),
      event_location: event.event_location || '',
      expected_footfalls: event.expected_footfalls,
      event_image: event.event_image || '',
      tshirt_front_image: event.tshirt_front_image || '',
      tshirt_back_image: event.tshirt_back_image || '',
      is_published: event.is_published
    });
    setShowEventForm(true);
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

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'upcoming': return <FaClock className="w-3 h-3" />;
      case 'ongoing': return <FaSpinner className="w-3 h-3 animate-spin" />;
      case 'completed': return <FaCheckCircle className="w-3 h-3" />;
      case 'cancelled': return <FaBan className="w-3 h-3" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <br/><br/>

      {/* Stats Cards */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Events</p>
                <p className="text-2xl font-bold text-gray-800">{profile?.total_events || events.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <FaCalendarAlt className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Footfalls</p>
                <p className="text-2xl font-bold text-gray-800">{profile?.total_footfalls || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FaUsers className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Ongoing Events</p>
                <p className="text-2xl font-bold text-gray-800">
                  {events.filter(e => e.event_status === 'ongoing').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <FaSpinner className="w-6 h-6 text-yellow-600 animate-spin" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Published Events</p>
                <p className="text-2xl font-bold text-gray-800">
                  {events.filter(e => e.is_published).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FaEye className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex gap-4 px-6">
              <button
                onClick={() => setActiveTab('events')}
                className={`py-4 px-2 font-medium transition-colors relative ${
                  activeTab === 'events'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FaCalendarAlt className="inline mr-2" />
                Events
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`py-4 px-2 font-medium transition-colors relative ${
                  activeTab === 'stats'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FaChartLine className="inline mr-2" />
                Statistics
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'events' && (
              <>
                {/* Filter and Add Button */}
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                  <div className="flex gap-2">
                    {['all', 'upcoming', 'ongoing', 'completed'].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setFilterStatus(status);
                          fetchEvents(status);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          filterStatus === status
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setEditingEvent(null);
                      setFormData({
                        event_name: '',
                        slug: '',
                        event_description: '',
                        event_start_date: '',
                        event_end_date: '',
                        event_location: '',
                        expected_footfalls: 0,
                        event_image: '',
                        tshirt_front_image: '',
                        tshirt_back_image: '',
                        is_published: false
                      });
                      setPositionCoordinates({
                        left_chest: { x: 22, y: 28 },
                        right_chest: { x: 58, y: 28 },
                        center: { x: 40, y: 55 },
                        back: { x: 40, y: 35 }
                      });
                      setImagePreviews({ event: '', front: '', back: '' });
                      setShowEventForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <FaPlus className="w-4 h-4" />
                    Create Event
                  </button>
                </div>

                {/* Events List */}
                {events.length === 0 ? (
                  <div className="text-center py-12">
                    <FaCalendarAlt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
                    <p className="text-gray-500 mb-4">Create your first event to get started</p>
                    <button
                      onClick={() => setShowEventForm(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <FaPlus className="w-4 h-4" />
                      Create Event
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {events.map((event) => (
                      <div key={event.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="flex flex-col md:flex-row">
                          {event.event_image && (
                            <div className="md:w-48 h-48 relative bg-gray-100">
                              <Image
                                src={event.event_image}
                                alt={event.event_name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 p-6">
                            <div className="flex flex-wrap justify-between items-start gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(event.event_status)}`}>
                                    {getStatusIcon(event.event_status)}
                                    {event.event_status.toUpperCase()}
                                  </span>
                                  {event.is_published ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      <FaEye className="w-3 h-3" />
                                      Published
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                      Draft
                                    </span>
                                  )}
                                </div>
                                
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                  {event.event_name}
                                </h3>
                                
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                  {event.event_description}
                                </p>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                  <div className="flex items-center gap-2 text-gray-500">
                                    <FaCalendarAlt className="w-4 h-4" />
                                    <span>
                                      {new Date(event.event_start_date).toLocaleDateString()} - {new Date(event.event_end_date).toLocaleDateString()}
                                    </span>
                                  </div>
                                  {event.event_location && (
                                    <div className="flex items-center gap-2 text-gray-500">
                                      <FaMapMarkerAlt className="w-4 h-4" />
                                      <span>{event.event_location}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 text-gray-500">
                                    <FaUsers className="w-4 h-4" />
                                    <span>Expected: {event.expected_footfalls}</span>
                                  </div>
                                </div>

                                <div className="flex gap-2 mt-3">
                                  {event.tshirt_front_image && (
                                    <span className="inline-flex items-center gap-1 text-xs text-green-600">
                                      <FaTshirt /> Front View ✓
                                    </span>
                                  )}
                                  {event.tshirt_back_image && (
                                    <span className="inline-flex items-center gap-1 text-xs text-green-600">
                                      <FaTshirt /> Back View ✓
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditEvent(event)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  <FaEdit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteEvent(event.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <FaTrash className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800">Event Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-medium text-gray-700 mb-4">Event Status Distribution</h3>
                    <div className="space-y-3">
                      {['upcoming', 'ongoing', 'completed', 'cancelled'].map((status) => {
                        const count = events.filter(e => e.event_status === status).length;
                        const percentage = events.length ? (count / events.length) * 100 : 0;
                        return (
                          <div key={status}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="capitalize">{status}</span>
                              <span>{count} events ({percentage.toFixed(0)}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  status === 'upcoming' ? 'bg-blue-500' :
                                  status === 'ongoing' ? 'bg-green-500' :
                                  status === 'completed' ? 'bg-gray-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-medium text-gray-700 mb-4">Total Footfalls</h3>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-purple-600">
                        {events.reduce((sum, e) => sum + (e.actual_footfalls || e.expected_footfalls), 0)}
                      </p>
                      <p className="text-gray-500 mt-2">Expected total attendees</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h2>
              <div className="flex gap-2">
                {editingEvent && (formData.tshirt_front_image || formData.tshirt_back_image) && (
                  <button
                    type="button"
                    onClick={() => setShowPositionCustomizer(!showPositionCustomizer)}
                    className="px-3 py-1 bg-purple-100 text-purple-600 rounded-lg text-sm hover:bg-purple-200 transition-colors"
                  >
                    {showPositionCustomizer ? 'Hide Position Customizer' : 'Customize Logo Positions'}
                  </button>
                )}
                <button
                  onClick={() => setShowEventForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmitEvent} className="p-6 space-y-6">
              {/* Basic Event Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.event_name}
                    onChange={handleEventNameChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter event name"
                  />
                </div>

                {/* Slug Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event URL Slug
                    <span className="text-xs text-gray-500 ml-2">(SEO-friendly URL)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">/events/</span>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="event-url-slug"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This will be used in the event URL. Use only letters, numbers, and hyphens.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Description
                  </label>
                  <textarea
                    rows={4}
                    value={formData.event_description}
                    onChange={(e) => setFormData({ ...formData, event_description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Describe your event"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.event_start_date}
                      onChange={(e) => setFormData({ ...formData, event_start_date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.event_end_date}
                      onChange={(e) => setFormData({ ...formData, event_end_date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.event_location}
                    onChange={(e) => setFormData({ ...formData, event_location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Event location"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Footfalls
                  </label>
                  <input
                    type="number"
                    value={formData.expected_footfalls}
                    onChange={(e) => setFormData({ ...formData, expected_footfalls: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Number of expected attendees"
                  />
                </div>
              </div>

              {/* Image Uploads Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Event Images</h3>
                
                {/* Event Banner Image */}
                <div className="border rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Banner Image *
                    <span className="text-xs text-gray-500 ml-2">(Min 800x400px, Max 5MB)</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handleImageUpload(e, 'event')}
                      className="hidden"
                      id="event-image-upload"
                    />
                    <label
                      htmlFor="event-image-upload"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors"
                    >
                      <FaCamera className="w-4 h-4" />
                      Upload Event Image
                    </label>
                    {uploadingImage === 'event' && (
                      <div className="flex items-center gap-2">
                        <FaSpinner className="w-4 h-4 animate-spin text-purple-600" />
                        <span className="text-sm text-gray-500">Uploading...</span>
                      </div>
                    )}
                    {formData.event_image && !uploadingImage && (
                      <div className="flex items-center gap-2 text-green-600">
                        <FaCheck className="w-4 h-4" />
                        <span className="text-sm">Uploaded</span>
                      </div>
                    )}
                  </div>
                  {imageErrors.event && (
                    <p className="text-red-500 text-xs mt-2">{imageErrors.event}</p>
                  )}
                  {formData.event_image && (
                    <div className="mt-3 relative w-32 h-32">
                      <Image
                        src={formData.event_image}
                        alt="Event preview"
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  )}
                  {imagePreviews.event && !formData.event_image && (
                    <div className="mt-3 relative w-32 h-32">
                      <Image
                        src={imagePreviews.event}
                        alt="Event preview"
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>

                {/* T-Shirt Front Image */}
                <div className="border rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    T-Shirt Front View Image
                    <span className="text-xs text-gray-500 ml-2">(Min 1500x1500px, Square, Max 10MB)</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handleImageUpload(e, 'front')}
                      className="hidden"
                      id="tshirt-front-upload"
                    />
                    <label
                      htmlFor="tshirt-front-upload"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors"
                    >
                      <FaTshirt className="w-4 h-4" />
                      Upload Front View
                    </label>
                    {uploadingImage === 'front' && (
                      <div className="flex items-center gap-2">
                        <FaSpinner className="w-4 h-4 animate-spin text-purple-600" />
                        <span className="text-sm text-gray-500">Uploading...</span>
                      </div>
                    )}
                    {formData.tshirt_front_image && !uploadingImage && (
                      <div className="flex items-center gap-2 text-green-600">
                        <FaCheck className="w-4 h-4" />
                        <span className="text-sm">Uploaded</span>
                      </div>
                    )}
                  </div>
                  {imageErrors.front && (
                    <p className="text-red-500 text-xs mt-2">{imageErrors.front}</p>
                  )}
                  {formData.tshirt_front_image && (
                    <div className="mt-3 relative w-32 h-32">
                      <Image
                        src={formData.tshirt_front_image}
                        alt="T-Shirt Front preview"
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  )}
                  {imagePreviews.front && !formData.tshirt_front_image && (
                    <div className="mt-3 relative w-32 h-32">
                      <Image
                        src={imagePreviews.front}
                        alt="T-Shirt Front preview"
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>

                {/* T-Shirt Back Image */}
                <div className="border rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    T-Shirt Back View Image
                    <span className="text-xs text-gray-500 ml-2">(Min 1500x1500px, Square, Max 10MB)</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handleImageUpload(e, 'back')}
                      className="hidden"
                      id="tshirt-back-upload"
                    />
                    <label
                      htmlFor="tshirt-back-upload"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors"
                    >
                      <FaTshirt className="w-4 h-4" />
                      Upload Back View
                    </label>
                    {uploadingImage === 'back' && (
                      <div className="flex items-center gap-2">
                        <FaSpinner className="w-4 h-4 animate-spin text-purple-600" />
                        <span className="text-sm text-gray-500">Uploading...</span>
                      </div>
                    )}
                    {formData.tshirt_back_image && !uploadingImage && (
                      <div className="flex items-center gap-2 text-green-600">
                        <FaCheck className="w-4 h-4" />
                        <span className="text-sm">Uploaded</span>
                      </div>
                    )}
                  </div>
                  {imageErrors.back && (
                    <p className="text-red-500 text-xs mt-2">{imageErrors.back}</p>
                  )}
                  {formData.tshirt_back_image && (
                    <div className="mt-3 relative w-32 h-32">
                      <Image
                        src={formData.tshirt_back_image}
                        alt="T-Shirt Back preview"
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  )}
                  {imagePreviews.back && !formData.tshirt_back_image && (
                    <div className="mt-3 relative w-32 h-32">
                      <Image
                        src={imagePreviews.back}
                        alt="T-Shirt Back preview"
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Position Customizer Section */}
              {showPositionCustomizer && (formData.tshirt_front_image || formData.tshirt_back_image) && (
                <div className="border-2 border-purple-300 rounded-lg p-4 bg-purple-50">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FaCrosshairs className="text-purple-600" />
                    Logo Position Configuration
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Configure where sponsors can place their logos. Drag markers, choose shape, and set dimensions.
                  </p>
                  
                  {/* Position Selector */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {Object.entries(positionConfig).map(([key, config]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedConfigPosition(key)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedConfigPosition === key
                            ? 'bg-purple-600 text-white'
                            : config.enabled
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-gray-200 text-gray-500 line-through'
                        }`}
                      >
                        {key.replace('_', ' ').toUpperCase()}
                        {!config.enabled && ' (Disabled)'}
                      </button>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Front View */}
                    {formData.tshirt_front_image && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2 text-center">Front View</p>
                        <div className="relative bg-white rounded-lg overflow-hidden">
                          <div className="relative w-full aspect-[3/4]">
                            <Image
                              src={formData.tshirt_front_image}
                              alt="T-Shirt Front"
                              fill
                              className="object-contain"
                            />
                            {['left_chest', 'right_chest', 'center'].map((posKey) => {
                              const config = positionConfig[posKey as keyof PositionConfig];
                              if (!config.enabled) return null;
                              const isSelected = selectedConfigPosition === posKey;
                              return (
                                <div
                                  key={posKey}
                                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
                                    isSelected ? 'ring-4 ring-purple-600 rounded-full' : ''
                                  }`}
                                  style={{ 
                                    top: `${config.y}%`, 
                                    left: `${config.x}%`,
                                    width: `${config.shape === 'circular' ? config.width : config.width}px`,
                                    height: `${config.shape === 'circular' ? config.width : config.height}px`,
                                    marginLeft: `-${(config.shape === 'circular' ? config.width : config.width) / 2}px`,
                                    marginTop: `-${(config.shape === 'circular' ? config.width : config.height) / 2}px`
                                  }}
                                  onClick={() => setSelectedConfigPosition(posKey)}
                                >
                                  <div 
                                    className={`w-full h-full flex items-center justify-center border-2 border-purple-600 bg-purple-600 bg-opacity-30 ${
                                      config.shape === 'circular' ? 'rounded-full' : 'rounded-lg'
                                    }`}
                                  >
                                    <span className="text-xs text-white font-bold bg-purple-600 px-1 rounded">
                                      {posKey.replace('_', ' ')}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Back View */}
                    {formData.tshirt_back_image && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2 text-center">Back View</p>
                        <div className="relative bg-white rounded-lg overflow-hidden">
                          <div className="relative w-full aspect-[3/4]">
                            <Image
                              src={formData.tshirt_back_image}
                              alt="T-Shirt Back"
                              fill
                              className="object-contain"
                            />
                            {['back'].map((posKey) => {
                              const config = positionConfig[posKey as keyof PositionConfig];
                              if (!config.enabled) return null;
                              const isSelected = selectedConfigPosition === posKey;
                              return (
                                <div
                                  key={posKey}
                                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
                                    isSelected ? 'ring-4 ring-purple-600 rounded-full' : ''
                                  }`}
                                  style={{ 
                                    top: `${config.y}%`, 
                                    left: `${config.x}%`,
                                    width: `${config.width}px`,
                                    height: `${config.height}px`,
                                    marginLeft: `-${config.width / 2}px`,
                                    marginTop: `-${config.height / 2}px`
                                  }}
                                  onClick={() => setSelectedConfigPosition(posKey)}
                                >
                                  <div 
                                    className={`w-full h-full flex items-center justify-center border-2 border-purple-600 bg-purple-600 bg-opacity-30 ${
                                      config.shape === 'circular' ? 'rounded-full' : 'rounded-lg'
                                    }`}
                                  >
                                    <span className="text-xs text-white font-bold bg-purple-600 px-1 rounded">
                                      BACK
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Position Configuration Controls */}
                  <div className="mt-4 p-4 bg-white rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-3">
                      Configure {selectedConfigPosition.replace('_', ' ').toUpperCase()}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Enable/Disable Toggle */}
                      <div className="flex items-center gap-3">
                        <label className="text-sm text-gray-700">Enable Position</label>
                        <button
                          type="button"
                          onClick={() => togglePositionEnabled(selectedConfigPosition)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            positionConfig[selectedConfigPosition as keyof PositionConfig]?.enabled
                              ? 'bg-purple-600'
                              : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              positionConfig[selectedConfigPosition as keyof PositionConfig]?.enabled
                                ? 'translate-x-6'
                                : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Price */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Price (₹)</label>
                        <input
                          type="number"
                          value={positionConfig[selectedConfigPosition as keyof PositionConfig]?.price || 0}
                          onChange={(e) => updatePositionConfig(selectedConfigPosition, 'price', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-1 border rounded-lg text-sm"
                        />
                      </div>

                      {/* Shape Selection */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Logo Shape</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => updatePositionConfig(selectedConfigPosition, 'shape', 'circular')}
                            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                              positionConfig[selectedConfigPosition as keyof PositionConfig]?.shape === 'circular'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            Circular
                          </button>
                          <button
                            type="button"
                            onClick={() => updatePositionConfig(selectedConfigPosition, 'shape', 'rectangular')}
                            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                              positionConfig[selectedConfigPosition as keyof PositionConfig]?.shape === 'rectangular'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            Rectangular
                          </button>
                        </div>
                      </div>

                      {/* X Position */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">X Position (%)</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="0.5"
                            value={positionConfig[selectedConfigPosition as keyof PositionConfig]?.x || 50}
                            onChange={(e) => updatePositionConfig(selectedConfigPosition, 'x', parseFloat(e.target.value))}
                            className="flex-1"
                          />
                          <span className="text-xs font-mono w-12">
                            {positionConfig[selectedConfigPosition as keyof PositionConfig]?.x.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {/* Y Position */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Y Position (%)</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="0.5"
                            value={positionConfig[selectedConfigPosition as keyof PositionConfig]?.y || 50}
                            onChange={(e) => updatePositionConfig(selectedConfigPosition, 'y', parseFloat(e.target.value))}
                            className="flex-1"
                          />
                          <span className="text-xs font-mono w-12">
                            {positionConfig[selectedConfigPosition as keyof PositionConfig]?.y.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {/* Width */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Width (px)</label>
                        <input
                          type="number"
                          min="30"
                          max="300"
                          value={positionConfig[selectedConfigPosition as keyof PositionConfig]?.width || 60}
                          onChange={(e) => updatePositionConfig(selectedConfigPosition, 'width', parseInt(e.target.value))}
                          className="w-full px-3 py-1 border rounded-lg text-sm"
                        />
                      </div>

                      {/* Height (only for rectangular) */}
                      {positionConfig[selectedConfigPosition as keyof PositionConfig]?.shape === 'rectangular' && (
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Height (px)</label>
                          <input
                            type="number"
                            min="30"
                            max="300"
                            value={positionConfig[selectedConfigPosition as keyof PositionConfig]?.height || 60}
                            onChange={(e) => updatePositionConfig(selectedConfigPosition, 'height', parseInt(e.target.value))}
                            className="w-full px-3 py-1 border rounded-lg text-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const eventId = editingEvent?.id;
                      if (!eventId) {
                        alert('Please save the event first before configuring positions');
                        return;
                      }
                      savePositionConfiguration(eventId, positionConfig);
                    }}
                    className="mt-4 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Save Position Configuration
                  </button>
                </div>
              )}
              
              {/* Publish Option */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="is_published" className="text-sm text-gray-700">
                  Publish event immediately
                </label>
              </div>
              
              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  disabled={isSubmitting || uploadingImage !== null}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave className="w-4 h-4" />
                      {editingEvent ? 'Update Event' : 'Create Event'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEventForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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