// FormularioUsuario.js
import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";
import { db } from "../../database/firebaseconfig";
import { collection, addDoc } from "firebase/firestore";

const FormularioUsuario = ({ cargarDatos }) => {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [edad, setEdad] = useState("");

  const guardarUsuario = async () => {
    if (nombre && correo && telefono && edad) {
      try {
        await addDoc(collection(db, "usuarios"), {
          nombre: nombre,
          correo: correo,
          telefono: telefono,
          edad: parseInt(edad), // Se guarda como número
        });
        setNombre("");
        setCorreo("");
        setTelefono("");
        setEdad("");
        cargarDatos(); // Volver a cargar la lista
      } catch (error) {
        console.log("Error al registrar usuario:", error);
      }
    } else {
      alert("Por favor, complete todos los datos");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Registro de Usuarios</Text>

      <TextInput 
        style={styles.input}
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
      />

      <TextInput 
        style={styles.input}
        placeholder="Correo"
        value={correo}
        onChangeText={setCorreo}
        keyboardType="email-address"
      />

      <TextInput 
        style={styles.input}
        placeholder="Teléfono"
        value={telefono}
        onChangeText={setTelefono}
        keyboardType="phone-pad"
      />

      <TextInput 
        style={styles.input}
        placeholder="Edad"
        value={edad}
        onChangeText={setEdad}
        keyboardType="numeric"
      />

      <Button title="Guardar" onPress={guardarUsuario} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10 },
});

export default FormularioUsuario;