import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  Alert,
} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import {
  SafeAreaView,
  SafeAreaProvider,
} from 'react-native-safe-area-context';

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

import axios from 'axios';

const Stack = createNativeStackNavigator();
const dark = '#000000';
const API_URL = 'https://cgdkhufktnclezagrhek.supabase.co/rest/v1/usuario';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName='Login'>
          <Stack.Screen
            name="Login"
            component={TelaLogin}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Cadastro"
            component={TelaCadastro} />

          <Stack.Screen name="Notificacao"
            component={TelaNotificacao} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

// Tela Login
function TelaLogin({ navigation }) {
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');

  async function validarLogin() {
    if (!login.trim()) {
      Alert.alert('Atenção', 'Digite seu email.');
      return;
    }

    if (!senha.trim()) {
      Alert.alert('Atenção', 'Digite sua senha.');
      return;
    }

    try {
      console.log('Tentando login...');

      const response = await axios.get(API_URL, {
        params: {
          email: `eq.${login.trim()}`,
          senha: `eq.${senha}`,
          select: 'nome,email,token',
        },

        headers: {
          apikey: 'sb_publishable_IPsf8cTazQXIOxTS-EvkdQ_G7bVSGCj',
        },
      });

      console.log('Resposta da API:', response.data);

      // Nenhum usuário encontrado
      if (!response.data || response.data.length === 0) {
        Alert.alert(
          'Login inválido',
          'Email ou senha incorretos.'
        );
        return;
      }

      // Usuário encontrado
      const usuario = response.data[0];

      console.log('Login realizado!');
      console.log('Usuário:', usuario);

      // Vai para a tela de notificações
      navigation.navigate('Notificacao');

    } catch (error) {
      console.log(
        'Erro no login:',
        error.response?.data || error.message
      );

      Alert.alert(
        'Erro',
        'Não foi possível realizar o login.'
      );
    }
  }
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <Image
        style={styles.tinyLogo}
        source={{ uri: 'https://marketplace.canva.com/A5alg/MAESXCA5alg/1/tl/canva-user-icon-MAESXCA5alg.png' }}
      />

      <View style={styles.container_inputs}>
        <Text>Login</Text>
        <TextInput
          style={styles.input}
          value={login}
          onChangeText={setLogin}
          autoCapitalize="none"
        />

        <Text>Senha</Text>
        <TextInput
          style={styles.input}
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />
      </View>

      <View style={styles.container_btn}>
        <TouchableOpacity
          style={styles.botao}
          onPress={validarLogin}
        >
          <Text style={styles.texto}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botao}
          onPress={() => navigation.navigate('Cadastro')}
        >
          <Text style={styles.texto}>Cadastro</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Tela Cadastro 
function TelaCadastro({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [token, setToken] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    obterToken();
  }, []);

  async function obterToken() {
    try {
      if (!Device.isDevice) {
        console.log('ERRO: não é um dispositivo físico');
        return;
      }

      // Verifica a permissão
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } =
          await Notifications.requestPermissionsAsync();

        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('ERRO: permissão de notificação negada');
        return;
      }

      // Canal do Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
        });
      }

      // Pega o Project ID
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ||
        Constants.easConfig?.projectId;

      console.log('PROJECT ID:', projectId);

      if (!projectId) {
        console.log('ERRO: Project ID não encontrado');
        return;
      }

      // Pega o Expo Push Token
      const pushToken = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      console.log('========================');
      console.log('EXPO PUSH TOKEN:');
      console.log(pushToken.data);
      console.log('========================');

      setToken(pushToken.data);

    } catch (error) {
      console.log('ERRO AO PEGAR TOKEN:', error);
    }
  }


  async function cadastrar() {

    console.log('DADOS DO CADASTRO:');
    console.log('Nome:', nome);
    console.log('Email:', email);
    console.log('Senha:', senha);
    console.log('TOKEN:', token);

      const response = await axios.post(
        API_URL,
        {
          nome,
          email,
          senha,
          token,
        },
        {
          headers: {
            apikey: 'sb_publishable_IPsf8cTazQXIOxTS-EvkdqG7bVSGCj',
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Cadastro realizado:', response.data);

      navigation.navigate('Login');

  }


  return (
    <View style={styles.container}>
      <View style={styles.container_inputs}>
        <Text>Nome</Text>
        <TextInput style={styles.input} value={nome} onChangeText={setNome} />

        <Text>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text>Senha</Text>
        <TextInput
          style={styles.input}
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />
      </View>

      <Text>Token do aparelho:</Text>
      <Text>{token} </Text>

      <View style={styles.container_btn}>
        <TouchableOpacity style={styles.botao} onPress={cadastrar}>
          <Text style={styles.texto}>Cadastrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function TelaNotificacao() {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);

  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');

  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    carregarUsuarios();
  }, []);

  async function carregarUsuarios() {
    try {
      setCarregando(true);

      const response = await axios.get(API_URL, {
        params: {
          select: 'nome,email,token',
        },
        headers: {
          apikey: 'sb_publishable_IPsf8cTazQXIOxTS-EvkdQ_G7bVSGCj',
        },
      });

      console.log('Usuários encontrados:', response.data);

      setUsuarios(response.data);

    } catch (error) {
      console.log(
        'Erro ao carregar usuários:',
        error.response?.data || error.message
      );

      Alert.alert(
        'Erro',
        'Não foi possível carregar os usuários.'
      );

    } finally {
      setCarregando(false);
    }
  }

  async function enviarNotificacao() {
    if (!usuarioSelecionado) {
      Alert.alert(
        'Atenção',
        'Selecione um usuário.'
      );
      return;
    }

    if (!titulo.trim()) {
      Alert.alert(
        'Atenção',
        'Digite um título.'
      );
      return;
    }

    if (!mensagem.trim()) {
      Alert.alert(
        'Atenção',
        'Digite uma mensagem.'
      );
      return;
    }

    if (!usuarioSelecionado.token) {
      Alert.alert(
        'Erro',
        'Esse usuário não possui um token de notificação.'
      );
      return;
    }

    try {
      setEnviando(true);

      const resposta = await fetch(
        'https://exp.host/--/api/v2/push/send',
        {
          method: 'POST',

          headers: {
            Accept: 'application/json',
            'Accept-Encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            to: usuarioSelecionado.token,
            sound: 'default',
            title: titulo.trim(),
            body: mensagem.trim(),

            data: {
              origem: 'painel',
            },
          }),
        }
      );

      const resultado = await resposta.json();

      console.log(
        'Resposta do Expo:',
        resultado
      );

      if (!resposta.ok) {
        throw new Error(
          'Erro ao enviar para o Expo.'
        );
      }

      // Verifica se o ticket retornou erro
      const ticket = resultado?.data;

      if (ticket?.status === 'error') {
        Alert.alert(
          'Erro',
          ticket.message || 'O Expo não conseguiu enviar a notificação.'
        );
        return;
      }

      Alert.alert(
        'Sucesso',
        `Notificação enviada para ${usuarioSelecionado.nome}!`
      );

      setTitulo('');
      setMensagem('');

    } catch (error) {
      console.log(
        'Erro ao enviar notificação:',
        error
      );

      Alert.alert(
        'Erro',
        'Não foi possível enviar a notificação.'
      );

    } finally {
      setEnviando(false);
    }
  }

  function selecionarUsuario(usuario) {
    setUsuarioSelecionado(usuario);
  }

  return (
    <View style={styles.container}>

      <Text style={styles.tituloTela}>
        Enviar Notificação
      </Text>

      <Text style={styles.label}>
        Selecione um usuário
      </Text>

      {carregando ? (
        <Text>
          Carregando usuários...
        </Text>
      ) : (
        <FlatList
          style={styles.lista}
          data={usuarios}
          keyExtractor={(item, index) =>
            item.email || index.toString()
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.usuario,
                usuarioSelecionado?.email === item.email &&
                styles.usuarioSelecionado,
              ]}
              onPress={() => selecionarUsuario(item)}
            >
              <Text style={styles.nomeUsuario}>
                {item.nome}
              </Text>

              <Text style={styles.emailUsuario}>
                {item.email}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {usuarioSelecionado && (
        <Text style={styles.selecionado}>
          Usuário selecionado:{' '}
          {usuarioSelecionado.nome}
        </Text>
      )}

      <Text style={styles.label}>
        Título
      </Text>

      <TextInput
        style={styles.input}
        value={titulo}
        onChangeText={setTitulo}
        placeholder="Digite o título da notificação"
      />

      <Text style={styles.label}>
        Mensagem
      </Text>

      <TextInput
        style={styles.inputMensagem}
        value={mensagem}
        onChangeText={setMensagem}
        placeholder="Digite a mensagem"
        multiline
        maxLength={200}
      />

      <Text style={styles.contador}>
        {mensagem.length}/200
      </Text>

      <TouchableOpacity
        style={[
          styles.botao,
          enviando && styles.botaoDesabilitado,
        ]}
        onPress={enviarNotificacao}
        disabled={enviando}
      >
        <Text style={styles.texto}>
          {enviando
            ? 'Enviando...'
            : 'Enviar notificação'}
        </Text>
      </TouchableOpacity>

    </View>
  );
}

// ===== Styles =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },

  tinyLogo: {
    width: 50,
    height: 50,
    marginBottom: 20,
    borderRadius: 25,
  },

  input: {
    backgroundColor: '#fff',
    height: 40,
    marginVertical: 8,
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
  },

  botao: {
    backgroundColor: 'rgb(0, 170, 255)',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },

  botaosalvar: {
    backgroundColor: 'rgb(72, 234, 83)',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },

  botaoexcluir: {
    backgroundColor: 'rgb(225, 42, 42)',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },

  texto: {
    color: '#fff',
    fontWeight: 'bold',
  },

  container_btn: {
    gap: 10,
    marginTop: 20,
    width: 200,
  },

  container_inputs: {
    width: 200,
  },

  contato: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },

  nome: {
    fontWeight: 'bold',
    fontSize: 16,
  },

  telefone: {
    color: '#555',
  },

  tituloTela: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  label: {
    alignSelf: 'flex-start',
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },

  lista: {
    width: '100%',
    maxHeight: 180,
  },

  usuario: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 5,
    backgroundColor: '#fff',
  },

  usuarioSelecionado: {
    backgroundColor: '#e5f2ff',
    borderColor: 'rgb(0, 170, 255)',
  },

  nomeUsuario: {
    fontWeight: 'bold',
    fontSize: 16,
  },

  emailUsuario: {
    color: '#666',
    fontSize: 12,
    marginTop: 3,
  },

  selecionado: {
    marginTop: 8,
    color: 'rgb(0, 120, 200)',
    fontWeight: 'bold',
  },

  inputMensagem: {
    backgroundColor: '#fff',
    minHeight: 80,
    width: '100%',
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    textAlignVertical: 'top',
  },

  contador: {
    alignSelf: 'flex-end',
    color: '#777',
    fontSize: 12,
  },

  botaoDesabilitado: {
    backgroundColor: '#999',
  },
});
