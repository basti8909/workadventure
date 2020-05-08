import {GameScene} from "./GameScene";
import {ROOM} from "../../Enum/EnvironmentVariable"
import {
    Connexion,
    ConnexionInterface,
    GroupCreatedUpdatedMessageInterface,
    ListMessageUserPositionInterface
} from "../../Connexion";
import {SimplePeerInterface, SimplePeer} from "../../WebRtc/SimplePeer";
import {LogincScene} from "../Login/LogincScene";

export enum StatusGameManagerEnum {
    IN_PROGRESS = 1,
    CURRENT_USER_CREATED = 2
}

export interface HasMovedEvent {
    direction: string;
    x: number;
    y: number;
    character: string;
}

export class GameManager {
    status: number;
    private ConnexionInstance: Connexion;
    private currentGameScene: GameScene;
    private playerName: string;
    SimplePeer : SimplePeerInterface;
    private characterUserSelected: string;

    constructor() {
        this.status = StatusGameManagerEnum.IN_PROGRESS;
    }

    connect(name: string, characterUserSelected : string) {
        this.playerName = name;
        this.characterUserSelected = characterUserSelected;
        this.ConnexionInstance = new Connexion(name, this);
        return this.ConnexionInstance.createConnexion(characterUserSelected).then(() => {
            this.SimplePeer = new SimplePeer(this.ConnexionInstance);
        });
    }

    setCurrentGameScene(gameScene: GameScene) {
        this.currentGameScene = gameScene;
    }


    /**
     * Permit to create player in started room
     */
    createCurrentPlayer(): void {
        //Get started room send by the backend
        this.currentGameScene.createCurrentPlayer(this.ConnexionInstance.userId);
        this.status = StatusGameManagerEnum.CURRENT_USER_CREATED;
    }

    /**
     * Share position in game
     * @param ListMessageUserPosition
     */
    shareUserPosition(ListMessageUserPosition: ListMessageUserPositionInterface): void {
        if (this.status === StatusGameManagerEnum.IN_PROGRESS) {
            return;
        }
        try {
            this.currentGameScene.shareUserPosition(ListMessageUserPosition.listUsersPosition)
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Share group position in game
     */
    shareGroupPosition(groupPositionMessage: GroupCreatedUpdatedMessageInterface): void {
        if (this.status === StatusGameManagerEnum.IN_PROGRESS) {
            return;
        }
        try {
            this.currentGameScene.shareGroupPosition(groupPositionMessage)
        } catch (e) {
            console.error(e);
        }
    }

    deleteGroup(groupId: string): void {
        if (this.status === StatusGameManagerEnum.IN_PROGRESS) {
            return;
        }
        try {
            this.currentGameScene.deleteGroup(groupId)
        } catch (e) {
            console.error(e);
        }
    }

    getPlayerName(): string {
        return this.playerName;
    }

    getCharacterSelected(): string {
        return this.characterUserSelected;
    }

    pushPlayerPosition(event: HasMovedEvent) {
        this.ConnexionInstance.sharePosition(event.x, event.y, event.character, event.direction);
    }
}

export const gameManager = new GameManager();