'use client';
import { Provider } from "react-redux";
import store from "@/app/store/store";
import { AuthInitializer } from "./AuthInitializer";

const ProviderWrapper = ({ children }: { children: React.ReactNode }) => {

    return (
        <Provider store={store}>
            <AuthInitializer />
            {children}
        </Provider>
    )

};

export default ProviderWrapper;