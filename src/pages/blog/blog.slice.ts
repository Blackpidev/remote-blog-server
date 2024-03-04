import { PayloadAction, createAsyncThunk, createSlice, current } from '@reduxjs/toolkit'
import { PostType } from 'types/blog.type'
import http from 'utils/http/http'
interface BlogState {
  postList: PostType[]
  editingPost: PostType | null
}
const initialState: BlogState = {
  postList: [],
  editingPost: null
}

export const getPostList = createAsyncThunk('blog/getPostList', async (_, thunkAPI) => {
  const response = await http.get<PostType[]>('posts', {
    signal: thunkAPI.signal
  })
  return response.data
})

export const addPost = createAsyncThunk('blog/addPost', async (body: Omit<PostType, 'id'>, thunkAPI) => {
  const response = await http.post<PostType>('posts', body, {
    signal: thunkAPI.signal
  })
  console.log(body)
  return response.data
})

export const updatePost = createAsyncThunk(
  'blog/updatePost',
  async ({ postId, body }: { postId: string; body: PostType }, thunkAPI) => {
    const response = await http.put<PostType>(`posts/${postId}`, body, {
      signal: thunkAPI.signal
    })
    return response.data
  }
)

const sliceBlog = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    deletePost: (state, action: PayloadAction<string>) => {
      const postId = action.payload
      const foundPostIndex = state.postList.findIndex((post) => post.id === postId)
      if (foundPostIndex !== -1) {
        state.postList.splice(foundPostIndex, 1)
      }
    },
    editingPost: (state, action: PayloadAction<string>) => {
      const postId = action.payload
      const foundPost = state.postList.find((post) => post.id === postId) || null
      state.editingPost = foundPost
    },
    cancelEditPost: (state) => {
      state.editingPost = null
    },
    finishEditPost: (state, action: PayloadAction<PostType>) => {
      const postId = action.payload.id
      state.postList.some((post, index) => {
        if (post.id === postId) {
          state.postList[index] = action.payload
          return true
        }
        return false
      })
      state.editingPost = null
    }
  },
  extraReducers(builder) {
    builder
      .addCase(getPostList.fulfilled, (state, action) => {
        state.postList = action.payload
      })
      .addCase(addPost.fulfilled, (state, action) => {
        state.postList.push(action.payload)
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.postList.find((post, index) => {
          if (post.id === action.payload.id) {
            state.postList[index] = action.payload
            return true
          }
          return false
        })
        state.editingPost = null
      })
      .addMatcher(
        (action) => action.type.includes('cancel'),
        (state, action) => {
          console.log(current(state))
        }
      )
      .addDefaultCase((state, action) => {})
  }
})
export const { editingPost, deletePost, cancelEditPost, finishEditPost } = sliceBlog.actions

const blogReducer = sliceBlog.reducer
export default blogReducer
