import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: height * 0.1,
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    padding: width * 0.04,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: width * 0.03,
    marginBottom: height * 0.02,
  },
  textInput: {
    flex: 1,
    height: 50,
    fontSize: width * 0.045,
    color: '#333',
  },
  searchIcon: {
    fontSize: width * 0.06,
    color: '#aaa',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: height * 0.015,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  locationIcon: {
    fontSize: width * 0.05,
    color: '#555',
    marginRight: width * 0.03,
  },
  resultText: {
    fontSize: width * 0.04,
    color: '#333',
  },
});
