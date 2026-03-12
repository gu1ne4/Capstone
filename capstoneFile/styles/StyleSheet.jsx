import { StyleSheet, Dimensions } from "react-native"; 

// meow
const { width } = Dimensions.get("window"); 
const responsiveFontSize = Math.min(Math.max(width * 0.05, 14), 24);

const styles = StyleSheet.create({

  //adadaadada
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loginContainer: {
    display: 'flex',
    flexDirection: 'row',
    zIndex: 1,
    width: '100%',
    height: '100%'
  },

  gifContainer: {
    backgroundColor: '#3a40ff',
    width: '55%',
    zIndex: 2,
    borderRadius: 30,
    overflow: 'hidden',
    margin: 20,
    flex: 3,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 }, 
    shadowOpacity: 0.20,
    shadowRadius: 20,
  },

  loginSection: {
    backgroundColor: '#fefefe',
    width: '45%',
    padding: 100,
    paddingLeft: 100,
    justifyContent: 'center',
  },

  gifOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignContent: 'left',
    width: '100%',
    height: '100%',
    padding: 100,
  },

  whiteFont:{
    color: '#fff',
    fontFamily: "Segoe UI",
    fontSize: 90,
    lineHeight: 90,
  },

  agsikapTitle: { 
    fontSize: 40, 
    fontWeight: 'bold', 
    marginBottom: 10, 
    color: '#000', 
  }, 

  loginHeader: { 
    fontSize: 20, 
    fontWeight: '600', 
    marginBottom: 15,
    marginTop: 35, 
    color: '#333', 
  }, 

  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 45,
    marginRight: 20,
  },

  forgotPassword: {
    color: '#3a40ff',
    fontSize: 14,
  },

  loginSubtext: { 
    fontSize: 14, 
    color: '#666', 
    marginBottom: 40, 
    paddingRight: 20, 
  }, 

  // UPDATED: Input Group - Remove border here, add to inputField
  inputGroup: { 
    flexDirection: 'column', // Changed from row to column
    marginBottom: 10, // Reduced from 25
    marginRight: 20, 
    width: '100%',
    paddingLeft: 15
  }, 
  
  inputIcon: { 
    position: 'absolute',
    left: 15,
    top: 15,
    zIndex: 1,
    width: 20, 
    height: 20, 
  }, 

  // UPDATED: Input Field - Make it dominant
  inputField: { 
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#000',
    borderWidth: 1, // Moved border here from inputGroup
    borderColor: '#ccc',
    borderRadius: 8,
    paddingLeft: 45, // Space for icon
    paddingRight: 15,
    paddingVertical: 12,
    width: '100%',
  }, 

  
  loginButton: { 
    backgroundColor: '#000', 
    paddingVertical: 12, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginRight: 20, 
    marginTop: 10,
    width: '100%'
  }, 

  loginButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600', 
  },

  //-------------------FOR LOGIN VALIDATIONS-------------------//
  
  inputField: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 15, 
    paddingHorizontal: 15, 
    fontSize: 16,
    width: '100%', 
    minHeight: 50, 
  },

  inputError: {
    borderColor: '#ff4444',
    borderWidth: 2,
    backgroundColor: '#fff8f8',
  },

  inputValid: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },

  inputGroup: {
    marginBottom: 10, 
    width: '100%', 
  },

  fieldFeedbackContainer: {
  flexDirection: 'row',
  justifyContent: 'flex-end', 
  alignItems: 'center',
  width: '100%',
  marginTop: 4,
  position: 'relative', 
  },

  errorText: {
    color: '#ff4444',
    fontSize: 12,
    position: 'absolute', 
    left: 0, 
    top: 0, 
    right: 60, 
    textAlign: 'left',
    width: '100%',
  },

  charCount: {
    color: '#999',
    fontSize: 12,
    textAlign: 'right',
    width: 50, 
  },


  charCountError: {
    color: '#ff4444',
    fontWeight: 'bold',
  },

  charCountValid: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },

  loginButtonDisabled: {
  backgroundColor: '#cccccc', 
  opacity: 0.7,
}

 

});

export default styles