import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { makeRedirectUri } from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

const AuthGoogle = () => {
  const [userInformation, setUserInformation] = useState(null);
  const [googleRequest, googleResponse, googlePromptAsync] =
    Google.useAuthRequest({
      androidClientId:
        "169629215319-caqlqal43t3uoodqjf3br3qfre77315g.apps.googleusercontent.com",
      iosClientId:
        "169629215319-4v61conj80flfkkkb6irngcctechgcg7.apps.googleusercontent.com",
      redirectUri: makeRedirectUri({ useProxy: true }, { useProxy: true }),
    });

  useEffect(() => {
    handleSignInWithGoogle();
  }, [googleResponse]);
  async function handleSignInWithGoogle() {
    const user = await AsyncStorage.getItem("authenticatedUser");
    if (!user) {
      if (googleResponse?.type === "success") {
        await getUserInfo(googleResponse.authentication.accessToken);
      }
    } else {
      setUserInformation(JSON.parse(user));
    }
  }
  const getUserInfo = async (token) => {
    if (!token) return;
    try {
      const response = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const user = await response.json();
      await AsyncStorage.setItem("authenticatedUser", JSON.stringify(user));
      setUserInformation(user);
    } catch (error) {}
  };
  return (
    <>
      {!userInformation ? (
        <TouchableOpacity
          style={styles.buttonGoogle}
          onPress={() => {
            googlePromptAsync();
          }}
        >
          <Text style={styles.whiteText}>Sign in with Google</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.box}>
          {userInformation?.picture && (
            <Image
              source={{ uri: userInformation?.picture }}
              style={styles.image}
            />
          )}
          <Text style={styles.text}>Email: {userInformation.email}</Text>
          <Text style={styles.text}>
            Verified: {userInformation.verified_email ? "yes" : "no"}
          </Text>
          <Text style={styles.text}>Name: {userInformation.name}</Text>
          <TouchableOpacity
            style={styles.buttonGoogle}
            onPress={async () => {
              await AsyncStorage.removeItem("authenticatedUser");
              setUserInformation(null);
            }}
          >
            <Text style={styles.whiteText}> LogOut</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};
const styles = StyleSheet.create({
  box: {
    padding: 10,
    margin: 10,
  },
  buttonGoogle: {
    backgroundColor: "#2276D6",
    width: "100%",
    padding: 10,
  },
  whiteText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  text: {
    fontSize: 14,
    fontWeight: "bold",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
});

export default AuthGoogle;
