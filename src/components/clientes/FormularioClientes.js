import React from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";

const FormularioClientes = ({
  cargarDatos,
  nuevoCliente,
  manejoCambio,
  guardarCliente,
  actualizarCliente,
  modoEdicion,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>
        {modoEdicion ? "Actualizar Cliente" : "Registrar Cliente"}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={nuevoCliente.nombre}
        onChangeText={(nombre) => manejoCambio("nombre", nombre)}
      />

      <TextInput
        style={styles.input}
        placeholder="Apellido"
        value={nuevoCliente.apellido}
        onChangeText={(apellido) => manejoCambio("apellido", apellido)}
      />

      <Button
        title={modoEdicion ? "Actualizar" : "Guardar"}
        onPress={modoEdicion ? actualizarCliente : guardarCliente}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
  },
});

export default FormularioClientes;