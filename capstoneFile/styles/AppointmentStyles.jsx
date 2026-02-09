import { StyleSheet } from "react-native";

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

})

export default apStyle;