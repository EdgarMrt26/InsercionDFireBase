import React from "react";
import { Text, StyleSheet } from "react-native";

const TituloPromedio = ({ promedio }) => {
  return (
    <Text style={styles.titulo}>
      {promedio !== null && promedio !== undefined
        ? `Promedio: ${promedio.toFixed(2)}`
        : "Sin datos para calcular promedio"}
    </Text>
  );
};

const styles = StyleSheet.create({
  titulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
    color: "#333", // color por defecto
  },
});

export default TituloPromedio;