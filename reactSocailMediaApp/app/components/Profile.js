import React, { useEffect, useContext } from "react"
import Page from "./Page"
import { useParams, NavLink, Switch, Route } from "react-router-dom"
import Axios from "axios"
import StateContext from "../StateContext"
import ProfilePost from "./ProfilePost"
import ProfileFollowers from "./ProfileFollowers"
import ProfileFollowing from "./ProfileFollowing"
import { useImmer } from "use-immer"

function Profile() {
  const appState = useContext(StateContext)
  const { username } = useParams()
  const [state, setState] = useImmer({
    followActionLoading: false,
    startFollowingRequestCount: 0,
    stopFollowingRequestCount: 0,
    profileData: {
      profileUsername: "...",
      profileAvatar: "http://gravatar.com/avatar/placeholder?s=128",
      isFollowing: false,
      counts: { postCount: "", followerCount: "", followingCount: "" }
    }
  })
  // const [profileData, setProfileData] = useState()

  useEffect(() => {
    async function fetchProfileData() {
      try {
        const response = await Axios.post(`/profile/${username}`, { token: appState.user.token })
        // setProfileData(response.data)
        setState(draft => {
          draft.profileData = response.data
        })
      } catch (e) {
        console.log("There was the problem | profile")
      }
    }
    fetchProfileData()
  }, [username])

  //  Set Follow --------------------------------------------
  useEffect(() => {
    if (state.startFollowingRequestCount) {
      setState(draft => {
        draft.followActionLoading = true
      })
    }
    const ourRequest = Axios.CancelToken.source()
    console.log("---- 0")
    async function fetchProfileData() {
      try {
        console.log("---- 1")
        const response = await Axios.post(`/addFollow/${state.profileData.profileUsername}`, { token: appState.user.token }, { cancelToken: ourRequest.token })
        // setProfileData(response.data)
        console.log("---- 2")
        setState(draft => {
          draft.profileData.isFollowing = true
          draft.profileData.counts.followerCount++
          draft.followActionLoading = false
        })
      } catch (e) {
        console.log("There was the problem | addFollow", e)
      }
    }
    fetchProfileData()
    return () => {
      ourRequest.cancel()
    }
  }, [state.startFollowingRequestCount])

  //  Set UnFollow ------------------------------------------
  useEffect(() => {
    if (state.stopFollowingRequestCount) {
      setState(draft => {
        draft.followActionLoading = true
      })
    }
    const ourRequest = Axios.CancelToken.source()
    async function fetchProfileData() {
      try {
        const response = await Axios.post(`/removeFollow/${state.profileData.profileUsername}`, { token: appState.user.token }, { cancelToken: ourRequest.token })
        // setProfileData(response.data)
        setState(draft => {
          draft.profileData.isFollowing = false
          draft.profileData.counts.followerCount--
          draft.followActionLoading = false
        })
      } catch (e) {
        console.log("There was the problem | removeFollow")
      }
    }
    fetchProfileData()
    return () => {
      ourRequest.cancel()
    }
  }, [state.stopFollowingRequestCount])

  function startFollowing() {
    setState(draft => {
      draft.startFollowingRequestCount++
    })
  }

  function stopFollowing() {
    setState(draft => {
      draft.stopFollowingRequestCount++
    })
  }

  return (
    <Page title="Profile">
      <h2>
        <img className="avatar-small" src={state.profileData.profileAvatar} /> {state.profileData.profileUsername}
        {appState.loggedIn && !state.profileData.isFollowing && appState.user.username != state.profileData.profileUsername && state.profileData.profileUsername != "..." && (
          <button onClick={startFollowing} disabled={state.followActionLoading} className="btn btn-primary btn-sm ml-2">
            Follow <i className="fas fa-user-plus"></i>
          </button>
        )}
        {appState.loggedIn && state.profileData.isFollowing && appState.user.username != state.profileData.profileUsername && state.profileData.profileUsername != "..." && (
          <button onClick={stopFollowing} disabled={state.followActionLoading} className="btn btn-danger btn-sm ml-2">
            Stop Following <i className="fas fa-user-times"></i>
          </button>
        )}
      </h2>

      <div className="profile-nav nav nav-tabs pt-2 mb-4">
        <NavLink exact to={`/profile/${state.profileData.profileUsername}`} className="nav-item nav-link">
          Posts: {state.profileData.counts.postCount}
        </NavLink>
        <NavLink to={`/profile/${state.profileData.profileUsername}/followers`} className="nav-item nav-link">
          Followers: {state.profileData.counts.followerCount}
        </NavLink>
        <NavLink to={`/profile/${state.profileData.profileUsername}/following`} className="nav-item nav-link">
          Following: {state.profileData.counts.followingCount}
        </NavLink>
      </div>
      <Switch>
        <Route exact path="/profile/:username">
          <ProfilePost />
        </Route>
        <Route path="/profile/:username/followers">
          <ProfileFollowers />
        </Route>
        <Route path="/profile/:username/following">
          <ProfileFollowing />
        </Route>
      </Switch>
    </Page>
  )
}

export default Profile
