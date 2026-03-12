import { StyleSheet } from "react-native";

// meow
const userStyle = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f800',
    padding: 20,
  },

  navSections: {
    backgroundColor: '#fff',
    height: 60,
    paddingHorizontal: 30,
    borderRadius: 15,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 }, 
    shadowOpacity: 0.15,
    shadowRadius: 18,
  },

  navText: {
    fontSize: 16,
    color: '#333',
  },
  
    glassContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 20,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },

  navTextSelected: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007BFF',
  },

  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },

  serviceName: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 10,
    fontFamily: 'Arial',
    marginTop: 12,
    color: '#ffffffee',
  },

  serviceDescription: {
    fontSize: 12,
    color: '#f1f1f1',
    textAlign: 'center',
    fontWeight: 500
  },

  servicePrice: {
    fontSize: 15,
    color: '#ffffffee',
    marginTop: 20,
    fontWeight: '500',
  },

  btnStyle: {
    backgroundColor: '#3d67ee', padding: 12, borderRadius: 18, paddingHorizontal: 50, color: '#fffff'
  },

  tableHeader: {
    fontWeight: '500',
    fontSize: 13,
  },
  tableCell: {
    fontSize: 13,
    color: '#333',
    textAlign: 'left',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '30%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    position: 'relative',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
    padding: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 15,
    lineHeight: 24,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 10,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
  },

  rightPanelDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  rightPanelDetailLabel: {
    width: 50,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  rightPanelDetailValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  rightPanelDetailLabelSmall: {
    width: 100,
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  rightPanelDetailValueSmall: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },
  
});

export default userStyle;
