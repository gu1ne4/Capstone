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
        padding: 30,   
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
        flex: 6,
        paddingLeft: 15,
    },

    topContainer: {
        borderRadius: 20,
        height: '10%',
        alignItems: 'center',   

        display: 'flex',
        flexDirection: 'row',
    },

    subTopContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        height: '10%',
        padding: 30,
        alignItems: 'center',
        
        flex: 20,

        display: 'flex',
        flexDirection: 'row',

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 }, 
        shadowOpacity: 0.12,
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
        height: '85%',

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
        height: 35,
        justifyContent: 'center',
    },

    tableFont: {
        fontSize: 13,
        fontFamily: 'Segoe UI',
        color: '#000000',
    },
    
    tableHeader: {
        marginTop: 20,
        fontSize: 25,
        backgroundColor: '#ffffff',
    },

    pickerStyle: {
        height: 30,
        width: 100,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 2,
        borderColor: '#ccc',
        borderWidth: 1,
        fontSize: 13,
        fontFamily: 'Segoe UI',
    },

    clearFilterBtn: {
        backgroundColor: '#3d67ee',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        height: 30,
        marginLeft: 10,
        borderWidth: 1,
        borderColor: '#3d67ee',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
        zIndex: 1,
    },

    statusBadge: {
        marginTop: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },

    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },

    activeBadge: {
        backgroundColor: '#DFF5E1',
    },

    activeText: {
        color: '#1F7A3F',
    },

    inactiveBadge: {
        backgroundColor: '#ffc3c3',
    },

});

export default homeStyle;
