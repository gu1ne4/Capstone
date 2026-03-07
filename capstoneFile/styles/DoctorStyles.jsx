import { StyleSheet } from "react-native";

const docStyle = StyleSheet.create({
     tableContainer: {
        marginTop: 30,
        height: '100%',

        display: 'flex',
        flexDirection: 'row',
        paddingBottom: 30,
    }, 

    leftContainer: {
        flex: 2.5,
        paddingRight: 50,
        paddingLeft: 10
    },
    
    rightContainer: {
        flex: 1,
    },

    reportsContainer: {
        display: 'flex',
        flexDirection: 'row',
        gap: 30,
        marginTop: 20,
    },

    reportsSubContainer: {
        backgroundColor: '#fffefe',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 }, 
        shadowOpacity: 0.15,
        shadowRadius: 18,
    },

    glassContainer: {
        paddingVertical: 5,
        paddingHorizontal: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.15)', 
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.25)', 

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    }
});

export default docStyle;
