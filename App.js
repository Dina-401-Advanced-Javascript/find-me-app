import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, Button, View, FlatList, Linking } from 'react-native';
import * as Contacts from 'expo-contacts';
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
// import SendSMS from 'react-native-sms';
import * as SMS from 'expo-sms';
import qs from 'qs';

export default function App() {
  const [contacts, setContacts] = useState([]);
  const [location, setLocation] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const sendEmail = async (contact) => {
    //email the contact my location
    if (contact.emails) {
      let email = contact.emails[0].email;
      let subject = 'My location through Find Me app';
      let body = `Here is my current location: https://www.google.com/maps/search/?api=1&query=${location.coords.latitude},${location.coords.longitude}`;

      const query = qs.stringify({
        subject: subject,
        body: body
      });

      console.log(query);
      let link = `mailto:${email}?${query}`;
      console.log(link);

      Linking.canOpenURL(link)
        .then(supported => Linking.openURL(link))
        .catch(console.error);
    }
  }
  const sendMessage = async (contact) => {
    //text the contact my location
    const isAvailable = await SMS.isAvailableAsync();
    let phoneNumber = contact.phoneNumbers[0].number.replace(/[\(\)\-\s+]/g, '');
    console.log(location);
    let currentLocation = `Here is my current location: https://www.google.com/maps/search/?api=1&query=${location.coords.latitude},${location.coords.longitude}`;

    if (isAvailable) {
      // do your SMS stuff here
      const { result } = await SMS.sendSMSAsync(
        [phoneNumber],
        currentLocation
      );
    } else {
      console.log('SMS is not available on this device.');
    }
  }

  const getContactsAsync = async () => {
    // permissions returns only for location permissions on iOS and under certain conditions, see Permissions.LOCATION
    const { status } = await Permissions.askAsync(Permissions.CONTACTS);
    if (status === 'granted') {
      const contactList = await Contacts.getContactsAsync();
      // console.log(contactList);
      setContacts(contactList.data);
      return contactList;
    } else {
      setErrorMessage(errorMessage + 'Permission to access contacts was denied. ');
    }
  }

  async function getLocationAsync() {
    // permissions returns only for location permissions on iOS and under certain conditions, see Permissions.LOCATION
    const { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status === 'granted') {
      setLocation(await Location.getCurrentPositionAsync({ enableHighAccuracy: true }));
      // console.log(location);
      return location;
    } else {
      setErrorMessage(errorMessage + 'Permission to access location was denied. ');
    }
  }

  const getPermissions = async () => {
    getContactsAsync();
    getLocationAsync();
  }

  useEffect(() => {
    getPermissions();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Find Me</Text>
      <Text>{errorMessage}</Text>
      <FlatList
        style={styles.flatList}
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          item.name ?
            <Text style={styles.item}>{'\n'} {item.name} {item.phoneNumbers ? <Button style={styles.button} title="SMS" onPress={async () => await sendMessage(item)} /> : null} {item.emails ? <Button style={styles.button} title="Email" onPress={async () => await sendEmail(item)} /> : null}</Text>
            : null)}>
      </FlatList>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'stretch',
    justifyContent: 'center',
    width: '100%'
  },
  button: {
    backgroundColor: '#eee',
    color: '#000'
  },
  tableHeader: {
    fontSize: 18,
    padding: 5
  },
  header: {
    marginTop: 16,
    paddingVertical: 5,
    paddingTop: 45,
    // borderWidth: 4,
    // borderColor: "#20232a",
    // borderRadius: 6,
    backgroundColor: '#fff', //"#61dafb",
    color: "#20232a",
    textAlign: "center",
    fontSize: 30,
    fontWeight: "bold",
    textDecorationLine: "underline"
  },
  item: {
    fontSize: 16,
    paddingHorizontal: 5,
    textAlign: 'left',
    color: '#20232a'
  }
});
