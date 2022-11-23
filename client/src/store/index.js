import { createContext, useContext, useState } from 'react'
import { useHistory } from 'react-router-dom'
import jsTPS from '../common/jsTPS'
import api from './store-request-api'
import AuthContext from '../auth'


export const GlobalStoreContext = createContext({});

export const GlobalStoreActionType = {
    CREATE_NEW_LIST: "CREATE_NEW_LIST",
    LOAD_ID_NAME_PAIRS: "LOAD_ID_NAME_PAIRS",
    SET_CURRENT_LIST : "SET_CURRENT_LIST",
    SET_SELECTION_TYPE : "SET_SELECTION_TYPE",
}

const tps = new jsTPS();

const CurrentModal = {
    NONE : "NONE",
    DELETE_LIST : "DELETE_LIST",
    REMOVE_SONG : "REMOVE_SONG",
    EDIT_SONG : "EDIT_SONG",
    DUPLICATE_LIST : "DUPLICATE_LIST",
}

const SearchSelection = {
    HOME : "HOME",
    ALL_LISTS : "ALL_LISTS",
    USERS : "USERS",
}

function GlobalStoreContextProvider(props) {

    const [store, setStore] = useState({
        currentModal: CurrentModal.NONE,
        currentSelection: SearchSelection.ALL_LISTS,
        idNamePairs: [],
        currentList: null,
        currentSongIndex: -1,
        currentSong: null,
        newListCounter:0,
        listNameActive:false,
        listIdMarkedForDeletion: null,
        listMarkedForDeletion: null,
        listIdMarkedForDuplication: null,
        listMarkedForDuplication: null,
    });
    const history = useHistory();

    const { auth } = useContext(AuthContext);
    

    const storeReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            // CREATE A NEW LIST
            case GlobalStoreActionType.CREATE_NEW_LIST: {                
                return setStore((prevState)=>({
                    currentModal : CurrentModal.NONE,
                    currentSelection: prevState.currentSelection,
                    idNamePairs: prevState.idNamePairs,
                    currentList: payload,
                    currentSongIndex: -1,
                    currentSong: null,
                    newListCounter: prevState.newListCounter + 1,
                    listNameActive: false,
                    listIdMarkedForDeletion: null,
                    listMarkedForDeletion: null,
                    listIdMarkedForDuplication: null,
                    listMarkedForDuplication: null,
                }));
            }
            // GET ALL THE LISTS SO WE CAN PRESENT THEM
            case GlobalStoreActionType.LOAD_ID_NAME_PAIRS: {
                return setStore((prevState)=>({
                    currentModal : CurrentModal.NONE,
                    currentSelection: prevState.currentSelection,
                    idNamePairs: payload,
                    currentList: prevState.currentList,
                    currentSongIndex: -1,
                    currentSong: null,
                    newListCounter: prevState.newListCounter,
                    listNameActive: false,
                    listIdMarkedForDeletion: null,
                    listMarkedForDeletion: null,
                    listIdMarkedForDuplication: null,
                    listMarkedForDuplication: null,
                }));
            }
            // SINGLE CLICKS ON LIST
            case GlobalStoreActionType.SET_CURRENT_LIST: {
                return setStore((prevState)=>({
                    currentModal : CurrentModal.NONE,
                    currentSelection: prevState.currentSelection,
                    idNamePairs: prevState.idNamePairs,
                    currentList: payload,
                    currentSongIndex: -1,
                    currentSong: null,
                    newListCounter: store.newListCounter,
                    listNameActive: false,
                    listIdMarkedForDeletion: null,
                    listMarkedForDeletion: null,
                    listIdMarkedForDuplication: null,
                    listMarkedForDuplication: null,
                }));
            }

            case GlobalStoreActionType.SET_SELECTION_TYPE: {
                return setStore((prevState)=>({
                    currentModal : CurrentModal.NONE,
                    currentSelection: payload,
                    idNamePairs: [],
                    currentList: null,
                    currentSongIndex: -1,
                    currentSong: null,
                    newListCounter: prevState.newListCounter,
                    listNameActive: false,
                    listIdMarkedForDeletion: null,
                    listMarkedForDeletion: null,
                    listIdMarkedForDuplication: null,
                    listMarkedForDuplication: null,
                })); 
            }

            default:
                return store;
        }
    }

    // THIS FUNCTION CREATES A NEW LIST
    store.createNewList = async function () {
        let newListName = "Untitled" + store.newListCounter;
        const response = await api.createPlaylist(newListName, [], auth.user.email, false, 0,0,[]);//newListName, newSongs, userEmail, published, likes, dislikes, comments
        console.log("createNewList response: " + response);
        if (response.status === 201) {
            tps.clearAllTransactions();
            let newList = response.data.playlist;
            storeReducer({
                type: GlobalStoreActionType.CREATE_NEW_LIST,
                payload: newList
            }
            );
            history.push("/");  
        }
        else {
            console.log("API FAILED TO CREATE A NEW LIST");
        }
    }
    
    // LOADS PLAYLISTS 
    store.loadIdNamePairs = function () {
        async function asyncLoadIdNamePairs() {
            const response = await api.getPlaylistPairs();
            if (response.data.success) {
                let pairsArray = response.data.idNamePairs;
                storeReducer({
                    type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                    payload: pairsArray
                });
            }
            else {
                console.log("API FAILED TO GET THE LIST PAIRS");
            }
        }
        async function asyncLoadPublicIdNamePairs() {
            const response = await api.getPublicPlaylistPairs();
            if (response.data.success) {
                let pairsArray = response.data.idNamePairs;
                storeReducer({
                    type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                    payload: pairsArray
                });
            }
            else {
                console.log("API FAILED TO GET THE LIST PAIRS");
            }
        }
        if (store.currentSelection == SearchSelection.HOME){
            console.log('selection is HOME');
            asyncLoadIdNamePairs();
        }else if (store.currentSelection == SearchSelection.ALL_LISTS){
            console.log('selection is ALL_LIST');
            asyncLoadPublicIdNamePairs();
        }else if (store.currentSelection == SearchSelection.USERS) {
            console.log('selection is USERS');
        }
        
    }

    store.changeSelectionToHome = function() {
        storeReducer({
            type: GlobalStoreActionType.SET_SELECTION_TYPE,
            payload: SearchSelection.HOME
        });
    }

    return (
        <GlobalStoreContext.Provider value={{
            store
        }}>
            {props.children}
        </GlobalStoreContext.Provider>
    );
}

export default GlobalStoreContext;
export { GlobalStoreContextProvider };