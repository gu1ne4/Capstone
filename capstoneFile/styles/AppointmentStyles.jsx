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

})

export default apStyle;