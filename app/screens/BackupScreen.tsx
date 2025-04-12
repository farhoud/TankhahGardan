import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { Alert, ViewStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Button, Screen, Text } from "app/components"
import * as FileSystem from 'expo-file-system';
import * as SAF from 'expo-file-system';
import { useRealm } from "@realm/react";
import * as DocumentPicker from 'expo-document-picker';
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "app/models"

interface BackupScreenProps extends AppStackScreenProps<"Backup"> { }

export const BackupScreen: FC<BackupScreenProps> = observer(function BackupScreen() {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()

  // Pull in navigation via hook
  // const navigation = useNavigation()
  const realm = useRealm();

  const handleCopy = async () => {
    // Target folder and file path
    try {
      // Close Realm if open
      const realmPath = FileSystem.documentDirectory + "default.realm";
      const realmInstance = realm;
      realmInstance.close();

      // Ask permission to access a directory
      const perm = await SAF.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission Denied', 'You need to select a folder to export the file.');
        return;
      }

      const directoryUri = perm.directoryUri;

      // Create a file handle in that directory
      const fileUri = await SAF.StorageAccessFramework.createFileAsync(
        directoryUri,
        'default',
        'application/octet-stream' // Generic binary file
      );

      // Read Realm file content
      const realmData = await FileSystem.readAsStringAsync(FileSystem.documentDirectory + "default.realm", {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Write to public file
      await SAF.StorageAccessFramework.writeAsStringAsync(fileUri, realmData, {
        encoding: FileSystem.EncodingType.Base64,
      });

      Alert.alert('✅ Success', `Realm file saved to:\n${fileUri}`);

    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.message || 'Something went wrong');
    }
  };

  const restoreRealm = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const pickedUri = result.assets[0].uri;

      const realmData = await FileSystem.readAsStringAsync(pickedUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const realmPath = FileSystem.documentDirectory + "default.realm";

      realm.close();

      await FileSystem.writeAsStringAsync(realmPath, realmData, {
        encoding: FileSystem.EncodingType.Base64,
      });

      Alert.alert('✅ Restore Successful', 'Realm DB restored from backup.');
    } catch (err) {
      console.error(err);
      Alert.alert('❌ Restore Failed', err.message || 'Could not restore the file.');
    }
  };

  return (
    <Screen safeAreaEdges={["top"]} style={$root} preset="scroll">
      <Button onPress={handleCopy}>backup</Button>
      <Button onPress={restoreRealm}>Restore</Button>
    </Screen >
  )
})

const $root: ViewStyle = {
  flex: 1,
}
