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
    paddingVertical: 20,
    paddingHorizontal: 50,
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
  }
  
});

export default userStyle;
