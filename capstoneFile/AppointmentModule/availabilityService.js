// Service to manage vet availability data
const API_URL = 'http://localhost:3000';

export const availabilityService = {
  // Get day availability (all 7 days)
  async getDayAvailability() {
    try {
      const response = await fetch(`${API_URL}/api/day-availability`);
      if (!response.ok) throw new Error('Failed to load day availability');
      const data = await response.json();
      
      // Convert array to object for easy access
      const dayAvailability = {};
      data.day_availability.forEach(day => {
        dayAvailability[day.day_of_week] = day.is_available;
      });
      
      return dayAvailability;
    } catch (error) {
      console.error('Error loading day availability:', error);
      return {
        sunday: false,
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false
      };
    }
  },

  // Save day availability
  async saveDayAvailability(dayName, isAvailable) {
    try {
      const response = await fetch(`${API_URL}/api/day-availability/${dayName.toLowerCase()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: isAvailable })
      });
      
      if (!response.ok) throw new Error('Failed to save day availability');
      return await response.json();
    } catch (error) {
      console.error('Error saving day availability:', error);
      throw error;
    }
  },

  // Get time slots for a specific day
  async getTimeSlotsForDay(dayName) {
    try {
      const response = await fetch(`${API_URL}/api/time-slots/${dayName.toLowerCase()}`);
      if (!response.ok) throw new Error('Failed to load time slots');
      const data = await response.json();
      return data.timeSlots || [];
    } catch (error) {
      console.error('Error loading time slots:', error);
      return [];
    }
  },

  // Save time slots for a day
  // Save time slots for a day
async saveTimeSlots(dayName, slots) {
  try {
    console.log('Saving slots to API:', { dayName, slots });
    const response = await fetch(`${API_URL}/api/time-slots/${dayName.toLowerCase()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slots })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error response:', errorData);
      throw new Error(errorData.error || 'Failed to save time slots');
    }
    
    const data = await response.json();
    console.log('API save response:', data);
    return data;
  } catch (error) {
    console.error('Error saving time slots:', error);
    throw error;
  }
},

  // Delete a specific time slot
async deleteTimeSlot(slotId) {
  try {
    console.log('Calling delete API for slot:', slotId);
    const response = await fetch(`${API_URL}/api/time-slots/${slotId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Delete API error response:', errorData);
      throw new Error(errorData.error || 'Failed to delete time slot');
    }
    
    const data = await response.json();
    console.log('Delete API success response:', data);
    return data;
  } catch (error) {
    console.error('Error deleting time slot:', error);
    throw error;
  }
},

  // Get booked slots count for a specific time slot on a specific date
  async getBookedSlotsCount(timeSlotId, date) {
    try {
      const response = await fetch(`${API_URL}/api/appointments/booked-slots/${timeSlotId}?date=${date}`);
      if (!response.ok) throw new Error('Failed to load booked slots');
      const data = await response.json();
      return {
        bookedCount: data.bookedCount || 0,
        capacity: data.capacity || 1,
        availableSlots: data.availableSlots || 0
      };
    } catch (error) {
      console.error('Error loading booked slots:', error);
      return { bookedCount: 0, capacity: 1, availableSlots: 1 };
    }
  },

  // Create a new appointment
  async createAppointment(appointmentData) {
    try {
      const response = await fetch(`${API_URL}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create appointment');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  // Get all appointments for the schedule table
  async getAppointmentsForTable() {
    try {
      const response = await fetch(`${API_URL}/api/appointments/table`);
      if (!response.ok) throw new Error('Failed to load appointments');
      const data = await response.json();
      return data.appointments || [];
    } catch (error) {
      console.error('Error loading appointments:', error);
      return [];
    }
  },

  // Get doctors list
  async getDoctors() {
    try {
      const response = await fetch(`${API_URL}/accounts`);
      if (!response.ok) throw new Error('Failed to load doctors');
      const data = await response.json();
      // Filter for doctors/vets only
      return data.filter(account => {
        const role = account.role?.toLowerCase() || '';
        return role.includes('vet') || role.includes('doctor') || role.includes('veterinarian');
      });
    } catch (error) {
      console.error('Error loading doctors:', error);
      return [];
    }
  },

  // Assign doctor to appointment
  async assignDoctor(appointmentId, doctorId) {
    try {
      const response = await fetch(`${API_URL}/api/appointments/${appointmentId}/assign-doctor`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign doctor');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error assigning doctor:', error);
      throw error;
    }
  },

  // Add this to your availabilityService.js:

// Get all special dates
async getSpecialDates() {
  try {
    const response = await fetch(`${API_URL}/api/special-dates`);
    if (!response.ok) throw new Error('Failed to load special dates');
    const data = await response.json();
    return data.specialDates || [];
  } catch (error) {
    console.error('Error loading special dates:', error);
    return [];
  }
},

// Save a special date
async saveSpecialDate(eventName, eventDate) {
  try {
    const response = await fetch(`${API_URL}/api/special-dates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_name: eventName, event_date: eventDate })
    });
    
    if (!response.ok) throw new Error('Failed to save special date');
    return await response.json();
  } catch (error) {
    console.error('Error saving special date:', error);
    throw error;
  }
},

// Delete a special date
async deleteSpecialDate(eventDate) {
  try {
    const response = await fetch(`${API_URL}/api/special-dates/${eventDate}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Failed to delete special date');
    return await response.json();
  } catch (error) {
    console.error('Error deleting special date:', error);
    throw error;
  }
},

  // Cancel appointment
  async cancelAppointment(appointmentId) {
    try {
      const response = await fetch(`${API_URL}/api/appointments/${appointmentId}/cancel`, {
        method: 'PUT'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel appointment');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
  },

  // Add these methods to your availabilityService.js

// Update appointment status (complete or cancel)
async updateAppointmentStatus(appointmentId, status) {
  try {
    const response = await fetch(`${API_URL}/api/appointments/${appointmentId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to ${status} appointment`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error ${status}ing appointment:`, error);
    throw error;
  }
},

// Get completed/cancelled appointments for history
async getAppointmentHistory() {
  try {
    const response = await fetch(`${API_URL}/api/appointments/history`);
    if (!response.ok) throw new Error('Failed to load appointment history');
    const data = await response.json();
    return data.appointments || [];
  } catch (error) {
    console.error('Error loading appointment history:', error);
    return [];
  }
},

  // Check if a date is a special date (you'll need to implement this table)
  isSpecialDate(dateString, specialDates) {
    if (!specialDates || !dateString) return false;
    return specialDates.some(event => event.event_date === dateString);
  },

  // Get day name from date string
  getDayNameFromDate(dateString) {
    const date = new Date(dateString);
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  },

  // Format time slots for display with availability
  async formatTimeSlotsForDisplay(timeSlots, selectedDate) {
    if (!timeSlots || timeSlots.length === 0) return [];
    
    const formattedSlots = [];
    
    for (const slot of timeSlots) {
      // Get booked count for this slot on the selected date
      const availability = await this.getBookedSlotsCount(slot.id, selectedDate);
      
      // Format time for display
      const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
      };
      
      formattedSlots.push({
        id: slot.id,
        displayText: `${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`,
        startTime: slot.start_time,
        endTime: slot.end_time,
        capacity: slot.capacity,
        bookedCount: availability.bookedCount,
        availableSlots: availability.availableSlots
      });
    }
    
    return formattedSlots;
  }
};