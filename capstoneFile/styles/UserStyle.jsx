import { StyleSheet } from "react-native";

const userStyle = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // semi-transparent
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

  

});

export default userStyle;
