import React, { useEffect, createContext } from 'react'
import 'regenerator-runtime/runtime'

import RoomView from './components/RoomView'
import ChatView from './components/ChatView'
import InputView from './components/InputView'
import { connect, getLoginInfo, checkIsRegistered, getServerSettings } from './networking'
import reducer, { State, defaultState } from './reducer'
import {
  AuthenticateAction,
  Action,
  IsRegisteredAction,
  LoadMessageArchiveAction,
  ShowSideMenuAction,
  SendMessageAction,
  SpaceIsClosedAction,
  PlayerBannedAction
} from './Actions'
import ProfileView from './components/ProfileView'
import { useReducerWithThunk } from './useReducerWithThunk'
import MediaChatView from './components/MediaChatView'
import ProfileEditView from './components/ProfileEditView'
import SideNavView from './components/SideNavView'
import { IconContext } from 'react-icons/lib'
import { Modal } from './modals'
import { NoteWallView } from './components/NoteWallView'
import { ModalView } from './components/ModalView'
import SettingsView from './components/SettingsView'
import MediaSelectorView from './components/MediaSelectorView'
import CodeOfConductView from './components/CodeOfConductView'
import ScheduleView from './components/ScheduleView'
import HelpView from './components/HelpView'
import MapModalView from './components/MapModalView'
import LoggedOutView from './components/LoggedOutView'
import WelcomeModalView from './components/WelcomeModalView'
import GoHomeView from './components/GoHomeView'
import YouAreBannedView from './components/YouAreBannedView'
import RoomListView from './components/RoomListView'
import RainbowGateModalView from './components/feature/RainbowGateViews'
import DullDoorModalView from './components/feature/DullDoorViews'
import ServerSettingsView from './components/ServerSettingsView'
import ClientDeployedModal from './components/ClientDeployedModal'
import FullRoomIndexModalView from './components/feature/FullRoomIndexViews'
import HappeningNowView from './components/HappeningNowView'
import * as Storage from './storage'
import { TwilioChatContextProvider } from './videochat/twilioChatContext'

export const DispatchContext = createContext(null)
export const UserMapContext = createContext(null)
export const IsMobileContext = createContext(null)

const App = () => {
  const [state, dispatch] = useReducerWithThunk<Action, State>(
    reducer,
    defaultState
  )

  useEffect(() => {
    // TODO: This logic is gnarly enough I'd love to abstract it somewhere
    const login = getLoginInfo().then((login) => {
      if (!login) {
        // This should really be its own action distinct from logging in
        dispatch(AuthenticateAction(undefined, undefined, undefined))
      } else {
        console.log(login)
        const userId = login.user_claims.find(c => c.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier').val

        checkIsRegistered().then(async ({ registeredUsername, spaceIsClosed, isMod, isBanned }) => {
          if (!registeredUsername) {
            dispatch(AuthenticateAction(userId, login.user_id, login.provider_name))
            return
          }
          dispatch(AuthenticateAction(userId, registeredUsername, login.provider_name))

          if (isBanned) {
            dispatch(PlayerBannedAction({ id: userId, username: registeredUsername, isBanned: isBanned }))
            dispatch(IsRegisteredAction())
            return
          }

          if (spaceIsClosed) {
            dispatch(SpaceIsClosedAction())

            if (!isMod) {
              // non-mods shouldn't subscribe to SignalR if the space is closed
              dispatch(IsRegisteredAction())
              return
            }
          }

          const messageArchive = await Storage.getMessages()
          if (messageArchive) {
            dispatch(LoadMessageArchiveAction(messageArchive.messages, messageArchive.whispers))
          }

          dispatch(IsRegisteredAction())
          connect(userId, dispatch)
          getServerSettings(dispatch)

          window.addEventListener('resize', () => {})
        })
      }
    })
  }, [])

  const isMobile = window.outerWidth < 500

  const profile = state.visibleProfile ? (
    <ProfileView user={state.visibleProfile} whispers={state.whispers} />
  ) : (
    ''
  )

  if (!state.checkedAuthentication) {
    return <div />
  }

  if (state.checkedAuthentication && !state.authenticated) {
    return <LoggedOutView />
  }

  if (!state.hasRegistered) {
    // Fetching the handle like this is silly.
    return (
      <ProfileEditView
        isFTUE={true}
        defaultHandle={state.userMap[state.userId].username}
        user={state.profileData}
        prepopulateTwitterWithDefaultHandle={state.authenticationProvider === 'twitter'}
      />
    )
  }

  if (state.isClosed && !state.userMap[state.userId].isMod) {
    return <GoHomeView />
  } else if (state.isBanned) {
    return <YouAreBannedView />
  }

  let videoChatView
  if (state.inMediaChat) {
    videoChatView = (
      <MediaChatView
        peerIds={state.roomData[state.roomId].videoUsers}
        speakingPeerIds={state.speakingPeerIds}
      />
    )
  }

  let innerModalView, modalView

  // TODO: If we get more modal options than just a size boolean, make this an options object.
  let modalIsFullScreen = false

  switch (state.activeModal) {
    case Modal.ProfileEdit: {
      innerModalView = (
        <ProfileEditView
          isFTUE={false}
          defaultHandle={state.userMap[state.userId].username}
          user={state.profileData}
        />
      )
      break
    }
    case Modal.NoteWall: {
      const room = state.roomData[state.roomId]
      innerModalView = (
        <NoteWallView notes={room.notes} noteWallData={room.noteWallData} user={state.profileData} />
      )
      break
    }
    case Modal.Settings: {
      innerModalView = <SettingsView />
      break
    }
    case Modal.MediaSelector: {
      console.log('Opening media selector')
      innerModalView = (
        <MediaSelectorView
          initialAudioDeviceId={state.currentAudioDeviceId}
          initialVideoDeviceId={state.currentVideoDeviceId}
          showJoinButton={!state.inMediaChat}
          userIsSpeaking={state.speakingPeerIds.includes('self')}
          roomId={state.roomId}
        />
      )
      break
    }
    case Modal.CodeOfConduct: {
      innerModalView = <CodeOfConductView />
      break
    }
    case Modal.Schedule: {
      innerModalView = <ScheduleView />
      break
    }
    case Modal.Map: {
      modalIsFullScreen = true
      innerModalView = (
        <MapModalView roomData={state.roomData} currentRoomId={state.roomId} />
      )
      break
    }
    case Modal.RoomList: {
      innerModalView = <RoomListView rooms={Object.values(state.roomData)} />
      break
    }
    case Modal.Help: {
      innerModalView = <HelpView />
      break
    }
    case Modal.Welcome: {
      innerModalView = <WelcomeModalView />
      break
    }
    case Modal.ServerSettings: {
      innerModalView = <ServerSettingsView serverSettings={state.serverSettings} roomData={state.roomData}/>
      break
    }
    case Modal.ClientDeployed: {
      innerModalView = <ClientDeployedModal />
      break
    }
    case Modal.HappeningNow: {
      innerModalView = <HappeningNowView roomData={state.roomData} entries={state.serverSettings.happeningNowEntries}/>
      break
    }
    case Modal.FeatureRainbowGate: {
      innerModalView = <RainbowGateModalView />
      break
    }
    case Modal.FeatureDullDoor: {
      innerModalView = <DullDoorModalView />
      break
    }
    case Modal.FeatureFullRoomIndex: {
      innerModalView = <FullRoomIndexModalView rooms={Object.values(state.roomData)}/>
      break
    }
  }

  if (innerModalView) {
    modalView = <ModalView fullScreen={modalIsFullScreen}>{innerModalView}</ModalView>
  }

  const showMenu = () => {
    dispatch(ShowSideMenuAction())
  }

  const shouldShowMenu = !isMobile || state.mobileSideMenuIsVisible

  return (
    <IconContext.Provider value={{ style: { verticalAlign: 'middle' } }}>
      <DispatchContext.Provider value={dispatch}>
        <TwilioChatContextProvider>
          <IsMobileContext.Provider value={isMobile}>
            <UserMapContext.Provider
              value={{ userMap: state.userMap, myId: state.userId }}
            >
              <div
                id={
                  state.visibleProfile && !isMobile ? 'app-profile-open' : 'app'
                }
              >
                {shouldShowMenu ? (
                  <span>
                    <SideNavView
                      roomData={state.roomData}
                      currentRoomId={state.roomId}
                      username={state.userMap[state.userId].username}
                      spaceIsClosed={state.isClosed}
                    />
                    {/* Once we moved the sidebar to be position:fixed, we still
                  needed something to take up its space in the CSS grid.
                  This should be fixable via CSS, but sigh, it's 3 days before the event */}
                    <div id='side-nav-placeholder' />
                  </span>
                ) : (
                  <button id="show-menu" onClick={showMenu}>
                    <span role="img" aria-label="menu">
                    🍔
                    </span>
                  </button>
                )}
                {modalView}
                <div id="main" role="main">
                  {videoChatView}
                  {state.roomData[state.roomId] ? (
                    <RoomView
                      room={state.roomData[state.roomId]}
                      userId={state.userId}
                      roomData={state.roomData}
                      itemData={state.itemData}
                      self={state.userMap[state.userId]}
                    />
                  ) : null}
                  <ChatView messages={state.messages} autoscrollChat={state.autoscrollChat} serverSettings={state.serverSettings} />
                  <InputView
                    prepopulated={state.prepopulatedInput}
                    sendMessage={(message) =>
                      dispatch(SendMessageAction(message))
                    }
                  />
                </div>
                {profile}
              </div>
            </UserMapContext.Provider>
          </IsMobileContext.Provider>
        </TwilioChatContextProvider>
      </DispatchContext.Provider>
    </IconContext.Provider>
  )
}

export default App
