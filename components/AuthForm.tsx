"use client"

import Link from "next/link";
import Image from 'next/image';
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import CustomInput from "./CustomInput";
import { authFormSchema } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/actions/user.actions";

interface AuthFormProps {
  type: 'sign-in' | 'sign-up';
}

const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSignUp = async (data: z.infer<typeof formSchema>) => {
    try {
      const newUser = await signUp(data);
      setUser(newUser);
    } catch (error) {
      console.error("SignUp failed:", error);
    }
  };

  const handleSignIn = async (data: z.infer<typeof formSchema>) => {
    try {
      const response = await signIn({
        email: data.email,
        password: data.password,
      });

      if (response) {
        router.push('/');
      }
    } catch (error) {
      console.error("SignIn failed:", error);
    }
  };

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (data) => {
    setLoading(true);

    if (type === 'sign-up') {
      await handleSignUp(data);
    } else {
      await handleSignIn(data);
    }

    setLoading(false);
  };

  return (
    <section className="auth-form">
      <header className="flex flex-col gap-5 md:gap-8">
        <Link href="/" className="cursor-pointer flex items-center gap-1">
          <Image src="/icons/logo.svg" alt="Horizon logo" width={34} height={34} />
          <h1 className="text-26 font-ibm-plex-serif font-bold text-black-1">Horizon</h1>
        </Link>

        <div className="flex flex-col gap-1 md:gap-3">
          <h1 className="text-24 lg:text-36 font-semibold text-gray-900">
            {user ? 'Link Account' : type === 'sign-in' ? 'Sign in' : 'Sign Up'}
          </h1>
          <p className="text-16 font-normal text-gray-600">
            {user ? 'Link your account to get started' : 'Please enter your details'}
          </p>
        </div>
      </header>

      {user ? (
        <div className="flex flex-col gap-4">
          {/* Insert component for linking account here */}
        </div>
      ) : (
        <>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {type === 'sign-up' && (
                <>
                  <div className="flex gap-4">
                    <CustomInput
                      control={form.control}
                      name='firstName'
                      label='First Name'
                      placeholder="Enter your first name"
                    />
                    <CustomInput
                      control={form.control}
                      name='lastName'
                      label='Last Name'
                      placeholder="Enter your last name"
                    />
                  </div>
                  <CustomInput
                    control={form.control}
                    name='address1'
                    label='Address'
                    placeholder="Enter your specific address"
                  />
                  <CustomInput
                    control={form.control}
                    name='city'
                    label='City'
                    placeholder="Enter your city"
                  />
                  <div className="flex gap-4">
                    <CustomInput
                      control={form.control}
                      name='state'
                      label='State'
                      placeholder="eg: NY"
                    />
                    <CustomInput
                      control={form.control}
                      name='postalCode'
                      label='Postal Code'
                      placeholder="eg: 11101"
                    />
                  </div>
                  <div className="flex gap-4">
                    <CustomInput
                      control={form.control}
                      name='dateOfBirth'
                      label='Date Of Birth'
                      placeholder="yyyy-mm-dd"
                    />
                    <CustomInput
                      control={form.control}
                      name='ssn'
                      label='SSN'
                      placeholder="eg: 1234"
                    />
                  </div>
                </>
              )}
              <CustomInput
                control={form.control}
                name='email'
                label='Email'
                placeholder="Enter your email"
              />
              <CustomInput
                control={form.control}
                name='password'
                label='Password'
                type='password'
                placeholder="Enter your Password"
              />
              <div className="flex flex-col gap-4">
                <Button type="submit" className="form-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" /> &nbsp;
                      Loading...
                    </>
                  ) : type === 'sign-in' ? 'Sign In' : 'Sign Up'}
                </Button>
              </div>
            </form>
          </Form>

          <footer className="flex justify-center gap-1">
            <p className="text-14 font-normal text-gray-600">
              {type === 'sign-in' ? "Don't have an account?" : "Already have an account?"}
            </p>
            {type === 'sign-in' ? <Link className="form-link" href="/sign-up">Sign Up</Link> : <Link className="form-link" href="/sign-in">Sign In</Link>}
          </footer>
        </>
      )}
    </section>
  );
}

export default AuthForm;
