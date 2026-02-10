import { StyleSheet } from "react-native";

//meow
const apStyle = StyleSheet.create({
    sideContainer: {
        display: 'flex',
        flexDirection: 'column',
        flex: 0.8,
        gap: 20
    },

    bodyContainer: {
        flex: 2
    },

    tableContainer: {
        marginTop: 30,
        borderRadius: 20,
        height: '85%',
        gap: 20
    },

    whiteContainer: {
        borderRadius: 20,
        padding: 20,

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 }, 
        shadowOpacity: 0.15,
        shadowRadius: 18,
    },

    overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
    modalContainer: {
      width: '60%',
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 20,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      marginBottom: 15,
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      padding: 8,
      borderRadius: 5,
      marginTop: 10,
    },
    addBtn: {
      backgroundColor: '#3d67ee',
      padding: 10,
      borderRadius: 5,
      marginTop: 15,
      alignItems: 'center',
    },
    slotText: {
      fontSize: 14,
      marginTop: 5,
    },
    openBtn: {
      backgroundColor: '#3d67ee',
      padding: 12,
      borderRadius: 5,
      alignItems: 'center',
    },

    
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    
    sectionContainer: {
        marginBottom: 30,
    },
    
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
        color: '#333',
        borderBottomWidth: 2,
        borderBottomColor: '#3d67ee',
        paddingBottom: 8,
    },
    
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    
    detailItem: {
        width: '48%',
        marginBottom: 15,
    },
    
    detailLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    
    detailValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    
    appointmentCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 15,
        borderLeftWidth: 4,
        borderLeftColor: '#3d67ee',
    },
    
    visitsList: {
        marginTop: 10,
    },
    
    visitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 8,
        minWidth: 120,
        justifyContent: 'center',
    },
    
    actionButtonText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
    },
    
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        width: '90%',
        maxWidth: 400,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    
    modalButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 6,
        minWidth: 100,
        alignItems: 'center',
    },
    
    createAppointmentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3d67ee',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    
    createAppointmentButtonText: {
        color: '#fff',
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
    },
    
    // New styles for Create Appointment Modal
    formSection: {
        marginBottom: 25,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    
    formRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    
    formGroup: {
        flex: 1,
        marginBottom: 15,
    },
    
    formLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    
    formInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        backgroundColor: '#f9f9f9',
    },
    
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        backgroundColor: '#f9f9f9',
        overflow: 'hidden',
    },
    
    dateSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#f9f9f9',
        marginBottom: 10,
    },
    
    calendarContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 5,
        borderWidth: 1,
        borderColor: '#eee',
        marginBottom: 15,
    },
    
    timeSlotContainer: {
    flexDirection: 'row',
    marginTop: 5,
    height: 50, // Fixed height
    marginBottom: 10,
},

timeSlot: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    marginRight: 8,
    backgroundColor: '#f9f9f9',
    minWidth: 70, // Minimum width for each slot
    alignItems: 'center',
    justifyContent: 'center',
},

selectedTimeSlot: {
    backgroundColor: '#3d67ee',
    borderColor: '#3d67ee',
},

timeSlotText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
},

selectedTimeSlotText: {
    color: '#fff',
    fontWeight: '600',
},
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },

disabledTimeSlot: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
    opacity: 0.6
},

disabledTimeSlotText: {
    color: '#999'
},

timeSlot: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 5,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    minWidth: 150,
    position: 'relative'
},

timeSlotText: {
    fontSize: 14,
    color: '#333'
},

selectedTimeSlot: {
    backgroundColor: '#3d67ee',
    borderColor: '#3d67ee'
},

selectedTimeSlotText: {
    color: 'white',
    fontWeight: '600'
},

doctorOption: {
  padding: 15,
  marginBottom: 10,
  borderWidth: 1,
  borderColor: '#e0e0e0',
  borderRadius: 8,
  backgroundColor: '#fff',
},
selectedDoctorOption: {
  borderColor: '#3d67ee',
  backgroundColor: '#f0f4ff',
  borderWidth: 2,
},

})

export default apStyle;