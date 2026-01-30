import { StyleSheet } from "react-native"; 

const homeStyle = StyleSheet.create({
    biContainer: {
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        height: '100%',
    },

    navbarContainer: {
        flex: 1,
        padding: 30,
        paddingRight: 15,
    },

    navBody: {
        padding: 50,   
        alignItems: 'center',
        borderRadius: 20,
        height: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 }, 
        shadowOpacity: 0.15,
        shadowRadius: 18,
    },

    brandFont: {
         color: '#ffffff', 
         fontSize: 20, 
         fontWeight: '600' 
    },

    bodyContainer: {
        padding: 30,
        backgroundColor: '#ffffff',
        flex: 4,
        paddingLeft: 15,
    },

    topContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        height: '10%',
        padding: 30,
        alignItems: 'center',   

        display: 'flex',
        flexDirection: 'row',

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 }, 
        shadowOpacity: 0.15,
        shadowRadius: 18,
    },

    blueText: {
        fontSize: 16,
        color: '#3d67ee',
        fontWeight: '650',
        fontFamily: 'Segoe UI',
    },

    tableContainer: {
        marginTop: 30,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 30,
        height: '80%',

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 }, 
        shadowOpacity: 0.15,
        shadowRadius: 18,
    },

    tableLayer1: {
        flexDirection: 'row',
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 20,
    },

    subTable1 : {
        flexDirection: 'row',
        display: 'flex',
        gap: 20,
        flex: 1,
    },

    subTable2: {
        flex: 1,
        flexDirection: 'row',
        display: 'flex',
    },

    blackBtn: {
        backgroundColor: '#000',
        borderRadius: 8,
        paddingHorizontal: 20,
        paddingVertical: 10,
    }
});

export default homeStyle;
