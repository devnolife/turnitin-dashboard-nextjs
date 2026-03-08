import MockAdapter from "axios-mock-adapter"
import api from "../client"
import { mockData } from "./data"
import { setupAuthMocks } from "./auth"
import { setupUserMocks } from "./users"
import { setupAdminMocks } from "./admin"
import { setupPaymentMocks } from "./payments"
import { setupSubmissionMocks } from "./submissions"

const mock = new MockAdapter(api, { delayResponse: 1000 })

setupAuthMocks(mock, mockData)
setupUserMocks(mock, mockData)
setupAdminMocks(mock, mockData)
setupPaymentMocks(mock, mockData)
setupSubmissionMocks(mock, mockData)
