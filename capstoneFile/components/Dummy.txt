// Service to manage vet availability data
const API_URL = 'http://localhost:3000';
const VET_ID = 1;

export const availabilityService = {
  // Get all availability data for the vet
  async getAvailabilityData() {
    try {
      const response = await fetch(`${API_URL}/api/availability/${VET_ID}`);
      if (!response.ok) throw new Error('Failed to load availability data');
      const data = await response.json();
      
      // Convert day_availability array to object for easy access
      const dayAvailability = {};
      data.day_availability.forEach(day => {
        dayAvailability[day.day_of_week] = day.is_available;
      });
      
      return {
        dayAvailability,
        timeSlots: data.time_slots,
        specialDates: data.special_dates
      };
    } catch (error) {
      console.error('Error loading availability data:', error);
      return null;
    }
  },

  // availabilityService.js - Add this method
// Delete special date
async deleteSpecialDate(eventDate) {
  try {
    const response = await fetch(`${API_URL}/api/availability/special-dates/${VET_ID}/${eventDate}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete special date');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting special date:', error);
    throw error;
  }
},

  // Get available time slots for a specific day
  async getTimeSlotsForDay(dayName) {
    try {
      const response = await fetch(`${API_URL}/api/availability/time-slots/${VET_ID}/${dayName.toLowerCase()}`);
      if (!response.ok) throw new Error('Failed to load time slots');
      const data = await response.json();
      return data.timeSlots || [];
    } catch (error) {
      console.error('Error loading time slots:', error);
      return [];
    }
  },

  // Get booked slots count for a specific time slot on a specific date
  async getBookedSlotsCount(timeSlotId, date) {
    try {
      const response = await fetch(`${API_URL}/api/appointments/booked-slots/${timeSlotId}?date=${date}`);
      if (!response.ok) throw new Error('Failed to load booked slots');
      const data = await response.json();
      return data.bookedCount || 0;
    } catch (error) {
      console.error('Error loading booked slots:', error);
      return 0;
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


  async getDoctors() {
    try {
      const response = await fetch(`${API_URL}/accounts`);
      if (!response.ok) throw new Error('Failed to load doctors');
      const data = await response.json();
      // Filter for doctors/vets only - check both fullName and fullname
      return data.filter(account => {
        const role = account.role?.toLowerCase() || '';
        const isDoctor = role.includes('vet') || role.includes('doctor');
        return isDoctor;
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

  // Check if a date is a special date (holiday/event)
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

  // Save day availability to database (updated to accept pk_id)
async saveDayAvailability(dayName, isAvailable, pkId = null) {
  try {
    const response = await fetch(`${API_URL}/api/availability/day`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vet_id: VET_ID,
        day_of_week: dayName.toLowerCase(),
        pk_id: pkId, // Include PK ID
        is_available: isAvailable
      })
    });
    
    if (!response.ok) throw new Error('Failed to save day availability');
    return await response.json();
  } catch (error) {
    console.error('Error saving day availability:', error);
    throw error;
  }
},

  // Get formatted time slots for display with availability
  async formatTimeSlotsForDisplay(timeSlots, selectedDate) {
    if (!timeSlots || timeSlots.length === 0) return [];
    
    const formattedSlots = [];
    
    for (const slot of timeSlots) {
      // Get booked count for this slot on the selected date
      const bookedCount = await this.getBookedSlotsCount(slot.id, selectedDate);
      
      // Format time for display (e.g., "08:00 AM - 09:00 AM")
      const formatTime = (time24) => {
        if (!time24) return '';
        const [hours, minutes] = time24.split(':');
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
        capacity: slot.capacity || slot.slot_capacity || 1,
        bookedCount: bookedCount,
        availableSlots: (slot.capacity || slot.slot_capacity || 1) - bookedCount
      });
    }

    
    
    return formattedSlots;
  }
};