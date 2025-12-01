// app/(public)/mapa-postos.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';

type FuelPrices = {
  GASOLINA?: { price: number; reportedAt: Date };
  ETANOL?: { price: number; reportedAt: Date };
  DIESEL?: { price: number; reportedAt: Date };
  GNV?: { price: number; reportedAt: Date };
};

type GasStation = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  hasElectricCharger: boolean;
  prices: FuelPrices;
};

export default function MapaPostos() {
  const router = useRouter();
  
  const [location, setLocation] = useState<any>(null);
  const [stations, setStations] = useState<GasStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<GasStation | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Novo posto
  const [newStation, setNewStation] = useState({
    name: '',
    address: '',
    hasElectricCharger: false,
    gasolina: '',
    etanol: '',
    diesel: '',
    gnv: '',
  });

  // Solicita permissão de localização
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos da sua localização para mostrar postos próximos');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });

      loadStations(loc.coords.latitude, loc.coords.longitude);
    })();
  }, []);

  const loadStations = async (lat: number, lng: number) => {
    try {
      const res = await api.get(`/gas-stations/nearby?lat=${lat}&lng=${lng}`);
      const data = res.data?.data || res.data || [];
      setStations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log('Erro ao carregar postos:', error);
      setStations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStation = async () => {
    if (!newStation.name.trim()) {
      Alert.alert('Atenção', 'Digite o nome do posto');
      return;
    }

    if (!location) {
      Alert.alert('Atenção', 'Aguarde a localização');
      return;
    }

    try {
      // Buscar endereço automaticamente da localização atual
      let address = 'Endereço não disponível';
      try {
        const geocode = await Location.reverseGeocodeAsync({
          latitude: location.latitude,
          longitude: location.longitude,
        });
        
        if (geocode && geocode.length > 0) {
          const addr = geocode[0];
          const parts = [
            addr.street,
            addr.streetNumber,
            addr.district,
            addr.city,
            addr.region,
          ].filter(Boolean);
          address = parts.join(', ');
        }
      } catch (geoError) {
        console.log('Erro ao buscar endereço:', geoError);
      }

      const fuelPrices = [];
      if (newStation.gasolina) fuelPrices.push({ fuelType: 'GASOLINA', price: parseFloat(newStation.gasolina) });
      if (newStation.etanol) fuelPrices.push({ fuelType: 'ETANOL', price: parseFloat(newStation.etanol) });
      if (newStation.diesel) fuelPrices.push({ fuelType: 'DIESEL', price: parseFloat(newStation.diesel) });
      if (newStation.gnv) fuelPrices.push({ fuelType: 'GNV', price: parseFloat(newStation.gnv) });

      await api.post('/gas-stations', {
        name: newStation.name,
        latitude: location.latitude,
        longitude: location.longitude,
        address: address,
        hasElectricCharger: newStation.hasElectricCharger,
        fuelPrices,
      });

      Alert.alert('Sucesso', 'Posto adicionado!');
      setShowAddModal(false);
      setNewStation({
        name: '',
        address: '',
        hasElectricCharger: false,
        gasolina: '',
        etanol: '',
        diesel: '',
        gnv: '',
      });
      loadStations(location.latitude, location.longitude);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível adicionar o posto');
    }
  };

  const handleUpdatePrices = async () => {
    if (!selectedStation) return;

    try {
      const fuelPrices = [];
      if (newStation.gasolina) fuelPrices.push({ fuelType: 'GASOLINA', price: parseFloat(newStation.gasolina) });
      if (newStation.etanol) fuelPrices.push({ fuelType: 'ETANOL', price: parseFloat(newStation.etanol) });
      if (newStation.diesel) fuelPrices.push({ fuelType: 'DIESEL', price: parseFloat(newStation.diesel) });
      if (newStation.gnv) fuelPrices.push({ fuelType: 'GNV', price: parseFloat(newStation.gnv) });

      if (fuelPrices.length === 0) {
        Alert.alert('Atenção', 'Preencha pelo menos um preço');
        return;
      }

      await api.post(`/gas-stations/${selectedStation.id}/prices`, { fuelPrices });

      Alert.alert('Sucesso', 'Preços atualizados!');
      setShowEditModal(false);
      setNewStation({
        name: '',
        address: '',
        hasElectricCharger: false,
        gasolina: '',
        etanol: '',
        diesel: '',
        gnv: '',
      });
      loadStations(location.latitude, location.longitude);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar os preços');
    }
  };

  const handleReport = async (reportType: string) => {
    if (!selectedStation) return;

    try {
      await api.post(`/gas-stations/${selectedStation.id}/report`, {
        reportType,
        comment: null,
      });

      Alert.alert('Obrigado!', 'Seu reporte foi enviado');
      setSelectedStation(null);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível enviar o reporte');
    }
  };

  const openInMaps = () => {
    if (!selectedStation) return;

    const { latitude, longitude } = selectedStation;
    const label = encodeURIComponent(selectedStation.name);

    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${label})`,
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  const openInWaze = () => {
    if (!selectedStation) return;

    const { latitude, longitude } = selectedStation;
    const url = `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
    Linking.openURL(url);
  };

  if (!location) {
    return (
      <View style={styles.loading}>
        <Text>Carregando mapa...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={location}
        showsUserLocation
        showsMyLocationButton
      >
        {stations.map((station) => (
          <Marker
            key={station.id}
            coordinate={{
              latitude: station.latitude,
              longitude: station.longitude,
            }}
            title={station.name}
            description={station.address}
            onPress={() => setSelectedStation(station)}
            pinColor={station.hasElectricCharger ? '#10b981' : '#ef4444'}
          />
        ))}
      </MapView>

      {/* Botão Adicionar */}
      <TouchableOpacity
        style={styles.btnAdd}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.btnAddText}>+ Adicionar Posto</Text>
      </TouchableOpacity>

      {/* Botão Voltar */}
      <TouchableOpacity
        style={styles.btnBack}
        onPress={() => router.back()}
      >
        <Text style={styles.btnBackText}>←</Text>
      </TouchableOpacity>

      {/* Modal de Detalhes */}
      {selectedStation && (
        <Modal
          visible={!!selectedStation}
          animationType="slide"
          transparent
          onRequestClose={() => setSelectedStation(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView>
                <Text style={styles.modalTitle}>{selectedStation.name}</Text>
                {selectedStation.address && (
                  <Text style={styles.modalAddress}>{selectedStation.address}</Text>
                )}

                {selectedStation.hasElectricCharger && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>⚡ Carregador Elétrico</Text>
                  </View>
                )}

                <Text style={styles.sectionTitle}>Preços</Text>
                {selectedStation.prices.GASOLINA && (
                  <View style={styles.priceRow}>
                    <Text style={styles.fuelType}>Gasolina:</Text>
                    <Text style={styles.price}>
                      R$ {selectedStation.prices.GASOLINA.price.toFixed(2)}
                    </Text>
                  </View>
                )}
                {selectedStation.prices.ETANOL && (
                  <View style={styles.priceRow}>
                    <Text style={styles.fuelType}>Etanol:</Text>
                    <Text style={styles.price}>
                      R$ {selectedStation.prices.ETANOL.price.toFixed(2)}
                    </Text>
                  </View>
                )}
                {selectedStation.prices.DIESEL && (
                  <View style={styles.priceRow}>
                    <Text style={styles.fuelType}>Diesel:</Text>
                    <Text style={styles.price}>
                      R$ {selectedStation.prices.DIESEL.price.toFixed(2)}
                    </Text>
                  </View>
                )}
                {selectedStation.prices.GNV && (
                  <View style={styles.priceRow}>
                    <Text style={styles.fuelType}>GNV:</Text>
                    <Text style={styles.price}>
                      R$ {selectedStation.prices.GNV.price.toFixed(2)}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.btnAction}
                  onPress={() => {
                    setShowEditModal(true);
                    setSelectedStation(null);
                  }}
                >
                  <Text style={styles.btnActionText}>✏️ Atualizar Preços</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnAction}
                  onPress={openInMaps}
                >
                  <Text style={styles.btnActionText}>📍 Abrir no GPS</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnAction}
                  onPress={openInWaze}
                >
                  <Text style={styles.btnActionText}>🚗 Abrir no Waze</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnReport}
                  onPress={() => handleReport('CLOSED')}
                >
                  <Text style={styles.btnReportText}>⚠️ Reportar Problema</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnClose}
                  onPress={() => setSelectedStation(null)}
                >
                  <Text style={styles.btnCloseText}>Fechar</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Modal Adicionar Posto */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalFull}>
          <ScrollView style={styles.form}>
            <Text style={styles.formTitle}>Adicionar Posto</Text>

            <Text style={styles.label}>Nome do Posto *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Shell Centro"
              value={newStation.name}
              onChangeText={(text) => setNewStation({ ...newStation, name: text })}
            />

            <Text style={styles.infoText}>
              📍 O posto será adicionado na sua localização atual
            </Text>

            <TouchableOpacity
              style={styles.checkbox}
              onPress={() =>
                setNewStation({
                  ...newStation,
                  hasElectricCharger: !newStation.hasElectricCharger,
                })
              }
            >
              <Text style={styles.checkboxText}>
                {newStation.hasElectricCharger ? '☑' : '☐'} Tem carregador elétrico
              </Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Preços (opcional)</Text>

            <Text style={styles.label}>Gasolina (R$)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 5.89"
              keyboardType="decimal-pad"
              value={newStation.gasolina}
              onChangeText={(text) => setNewStation({ ...newStation, gasolina: text })}
            />

            <Text style={styles.label}>Etanol (R$)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 3.99"
              keyboardType="decimal-pad"
              value={newStation.etanol}
              onChangeText={(text) => setNewStation({ ...newStation, etanol: text })}
            />

            <Text style={styles.label}>Diesel (R$)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 4.59"
              keyboardType="decimal-pad"
              value={newStation.diesel}
              onChangeText={(text) => setNewStation({ ...newStation, diesel: text })}
            />

            <Text style={styles.label}>GNV (R$)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 3.29"
              keyboardType="decimal-pad"
              value={newStation.gnv}
              onChangeText={(text) => setNewStation({ ...newStation, gnv: text })}
            />

            <TouchableOpacity style={styles.btnSubmit} onPress={handleAddStation}>
              <Text style={styles.btnSubmitText}>ADICIONAR POSTO</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnCancel}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={styles.btnCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal Editar Preços */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalFull}>
          <ScrollView style={styles.form}>
            <Text style={styles.formTitle}>Atualizar Preços</Text>

            <Text style={styles.label}>Gasolina (R$)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 5.89"
              keyboardType="decimal-pad"
              value={newStation.gasolina}
              onChangeText={(text) => setNewStation({ ...newStation, gasolina: text })}
            />

            <Text style={styles.label}>Etanol (R$)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 3.99"
              keyboardType="decimal-pad"
              value={newStation.etanol}
              onChangeText={(text) => setNewStation({ ...newStation, etanol: text })}
            />

            <Text style={styles.label}>Diesel (R$)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 4.59"
              keyboardType="decimal-pad"
              value={newStation.diesel}
              onChangeText={(text) => setNewStation({ ...newStation, diesel: text })}
            />

            <Text style={styles.label}>GNV (R$)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 3.29"
              keyboardType="decimal-pad"
              value={newStation.gnv}
              onChangeText={(text) => setNewStation({ ...newStation, gnv: text })}
            />

            <TouchableOpacity style={styles.btnSubmit} onPress={handleUpdatePrices}>
              <Text style={styles.btnSubmitText}>ATUALIZAR PREÇOS</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnCancel}
              onPress={() => setShowEditModal(false)}
            >
              <Text style={styles.btnCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnAdd: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#00a9ff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  btnAddText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnBack: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'white',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  btnBackText: {
    fontSize: 24,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  badge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  fuelType: {
    fontSize: 16,
    color: '#333',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00a9ff',
  },
  btnAction: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginTop: 12,
  },
  btnActionText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  btnReport: {
    backgroundColor: '#fef3c7',
    padding: 15,
    borderRadius: 8,
    marginTop: 12,
  },
  btnReportText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#92400e',
  },
  btnClose: {
    padding: 15,
    marginTop: 12,
  },
  btnCloseText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  modalFull: {
    flex: 1,
    backgroundColor: 'white',
  },
  form: {
    padding: 20,
    paddingTop: 60,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#00a9ff',
    marginTop: 12,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  checkboxText: {
    fontSize: 16,
    color: '#333',
  },
  btnSubmit: {
    backgroundColor: '#00a9ff',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  btnSubmitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  btnCancel: {
    padding: 16,
    marginTop: 12,
    marginBottom: 40,
  },
  btnCancelText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});
