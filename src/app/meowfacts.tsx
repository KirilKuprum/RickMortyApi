import { useEffect, useState } from 'react';
import { Button, Image, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

type Character = {
  id: number;
  name: string;
  status: string;
  species: string;
  image: string;
};

const BASE_URL = "https://rickandmortyapi.com/api/character/"

async function request<T>(path: string, params?:URLSearchParams, options: RequestInit = {}, headers = {}): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            }
    })

    if(!response.ok) throw new Error(`Fetch error: ${response.status}`);

    return response.json() as Promise<T>;
}

async function getCharacter(
    id?: number,
    filterName?: string,
    filterValue?: string,
    signal?: AbortSignal
): Promise<Character | null> {
    if (id !== undefined) {
        return request<Character>(`${id}`, undefined, { signal });
    }

    if (filterName?.trim() && filterValue?.trim()) {
        const params = new URLSearchParams();
        params.append(filterName.trim().toLowerCase(), filterValue.trim().toLowerCase());

        const data = await request<{ results: Character[] }>(`?${params.toString()}`, undefined, { signal });
        
        if (data.results && data.results.length > 0) {
            const randomIndex = Math.floor(Math.random() * data.results.length);
            return data.results[randomIndex];
        }
        return null;
    }

    const randomId = Math.floor(Math.random() * 826) + 1;
    return request<Character>(`${randomId}`, undefined, { signal });
}
export default function RequestsScreen() {
    const blockAnim = useSharedValue(1);
    const [character, setCharacter] = useState<Character | null>(null);
    const [filterName, setFilterName] = useState<string>('status');   
    const [filterValue, setFilterValue] = useState<string>('alive');

    const [countA, setCountA] = useState(0);
    const [countD, setCountD] = useState(0);
    const randomCharacter = () => {
    
        getCharacter(undefined, filterName, filterValue).then(data => {
        setCharacter(data); 
        if(data?.status == "Alive")
            setCountA(countA+1)
        else if(data?.status == "Dead")
            setCountD(countD+1)
        }); 
    };
    function blockScale() {
        blockAnim.value = withTiming(1, { 
            duration: 500, 
        }, () => {
            blockAnim.value = withTiming(2, { duration: 500 });
        });
    }
    function blockScaleBack() {
        blockAnim.value = withTiming(1, { 
            duration: 1000, 
        });
    }
    const blockAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: blockAnim.value }
        ],
    }));
    useEffect(() => {
        randomCharacter();
    }, [])


    return (
        <View style={styles.container}>
            {character && (
                <View style={styles.card}>
                    <Image source={{ uri: character.image }} style={styles.image} />
                    <Text style={styles.name}>{character.name}</Text>
                    <Text style={styles.details}>{character.status} - {character.species}</Text>

                    <Text style={styles.name}>You`ve seen living characters {countA} times</Text>
                    <Text style={styles.name}>You`ve seen dead characters {countD} times</Text>
                </View>
            )}

            <Animated.View style={[styles.buttonContainer,blockAnimatedStyle]}>
                <Pressable 
                    style={styles.button}
                    onPress={randomCharacter}
                    onPressIn={blockScale}
                    onPressOut={blockScaleBack} 
                >
                    <Text>
                        Далі
                    </Text>
                </Pressable>
            </Animated.View>
            <View style={styles.filterContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Filter`s name"
                    value={filterName}
                    onChangeText={setFilterName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Filter`s value"
                    value={filterValue}
                    onChangeText={setFilterValue}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center', 
        alignItems: 'center',     
        backgroundColor: 'white',
        paddingHorizontal: 20,
    },
    card: {
        alignItems: 'center',
        marginBottom: 20, 
    },
    image: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 10,
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    details: {
        fontSize: 14,
        color: 'gray',
    },
    buttonContainer: {
        maxWidth: 200,
    },
    filterContainer: {
        width: '100%',
        maxWidth: 250,
        marginBottom: 15,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 8,
        marginVertical: 5,
        fontSize: 14,
    },
    button: {
        backgroundColor: 'red',
        borderRadius:10,
        padding:10
    }
});