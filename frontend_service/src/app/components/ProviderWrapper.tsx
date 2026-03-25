'use client';
import { Provider } from "react-redux";
import store from "@/app/store/store";
import { AuthInitializer } from "./AuthInitializer";
import { Toaster } from "sonner";

const ProviderWrapper = ({ children }: { children: React.ReactNode }) => {

    return (
        <Provider store={store}>
            <AuthInitializer />
            {children}
            <Toaster position="bottom-right" richColors />
        </Provider>
    )

};

export default ProviderWrapper;