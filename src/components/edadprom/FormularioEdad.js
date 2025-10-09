import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";
import { db } from "../../database/firebaseconfig";
import { collection, addDoc } from "firebase/firestore";

const FormularioEdad = ({ cargarDatos }) => {
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");

  const guardarEdad = async () => {
    if (nombre && edad) {
      try {
        await addDoc(collection(db, "edades"), {
          nombre: nombre,
          edad: parseInt(edad), // Se guarda como número
        });
        setNombre("");
        setEdad("");
        cargarDatos(); // Volver a cargar la lista
      } catch (error) {
        console.log("Error al registrar edad:", error);
      }
    } else {
      alert("Por favor, complete todos los datos");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Registro de Edades</Text>

      <TextInput 
        style={styles.input}
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
      />

      <TextInput 
        style={styles.input}
        placeholder="Edad"
        value={edad}
        onChangeText={setEdad}
        keyboardType="numeric"
      />

      <Button title="Guardar" onPress={guardarEdad} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10 },
});

export default FormularioEdad;