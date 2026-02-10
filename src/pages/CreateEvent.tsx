import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { FiCalendar, FiMapPin, FiUsers, FiTag, FiSave, FiX } from 'react-icons/fi';

interface CreateEventFormData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  price: number;
}

export default function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<CreateEventFormData>({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    capacity: 100,
    price: 0,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === 'capacity' || name === 'price') {
      setFormData({ ...formData, [name]: Math.max(0, parseInt(value) || 0) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Event title is required');
      return false;
    }

    if (formData.title.trim().length < 5) {
      setError('Event title must be at least 5 characters');
      return false;
    }

    if (!formData.startTime) {
      setError('Start date and time are required');
      return false;
    }

    if (!formData.endTime) {
      setError('End date and time are required');
      return false;
    }

    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);

    if (start >= end) {
      setError('End time must be after start time');
      return false;
    }

    if (start.getTime() < Date.now()) {
      setError('Start time must be in the future');
      return false;
    }

    if (!formData.location.trim()) {
      setError('Location is required');
      return false;
    }

    if (formData.capacity < 1) {
      setError('Capacity must be at least 1');
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        startTime: new Date(formData.startTime),
        endTime: new Date(formData.endTime),
        location: formData.location.trim(),
        capacity: formData.capacity,
        price: formData.price,
      };

      await eventService.createEvent(eventData);
      
      setSuccess(true);
      
     
      setFormData({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        location: '',
        capacity: 100,
        price: 0,
      });

      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Failed to create event:', err);
      setError(err.response?.data?.error || 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTimes = (hours: number) => {
    const start = new Date();
    start.setMinutes(0, 0, 0);
    start.setHours(start.getHours() + 1); 
    
    const end = new Date(start);
    end.setHours(end.getHours() + hours);

    setFormData({
      ...formData,
      startTime: start.toISOString().slice(0, 16),
      endTime: end.toISOString().slice(0, 16),
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link 
          to="/dashboard" 
          className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-4"
        >
          <FiX className="mr-2" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
        <p className="text-gray-600 mt-2">
          Organize a new event and start selling tickets
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Event Details</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <FiX className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
              <svg className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Event created successfully! Redirecting to dashboard...</span>
            </div>
          )}

          <div className="space-y-6">
           
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Tech Conference 2024"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                maxLength={100}
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.title.length}/100 characters
              </p>
            </div>

 
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell attendees about your event..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                maxLength={1000}
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.description.length}/1000 characters
              </p>
            </div>

            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Date & Time <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <label htmlFor="startTime" className="block text-xs text-gray-600 mb-1">
                    Start Date & Time
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="datetime-local"
                      id="startTime"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="endTime" className="block text-xs text-gray-600 mb-1">
                    End Date & Time
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="datetime-local"
                      id="endTime"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => handleQuickTimes(3)}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  Set 3-hour event
                </button>
                <span className="text-xs text-gray-400">•</span>
                <button
                  type="button"
                  onClick={() => handleQuickTimes(8)}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  Set 8-hour event (full day)
                </button>
              </div>
            </div>

         
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Lagos Convention Center, Victoria Island"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
            </div>

           
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
                  <FiUsers className="inline mr-1" />
                  Maximum Capacity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Maximum number of attendees
                </p>
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  <FiTag className="inline mr-1" />
                  Ticket Price (₦) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.price === 0 ? 'Free event' : `₦${formData.price.toLocaleString()} per ticket`}
                </p>
              </div>
            </div>

           
            <div className="pt-6 border-t border-gray-200 flex justify-between items-center">
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Event...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2" />
                    Create Event
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

     
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Tips for Creating Great Events</h3>
        <ul className="space-y-2 text-blue-800 text-sm">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Write a compelling title that clearly describes your event</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Add a detailed description to help attendees understand what to expect</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Set realistic capacity limits based on your venue</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Price tickets competitively for your target audience</span>
          </li>
        </ul>
      </div>
    </div>
  );
}