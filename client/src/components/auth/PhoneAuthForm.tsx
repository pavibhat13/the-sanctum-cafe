import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const phoneSchema = z.object({
  phone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^\d+$/, "Phone number must contain only digits")
});

const nameSchema = z.object({
  name: z.string().min(1, "Name is required")
});

interface PhoneAuthFormProps {
  onSuccess?: () => void;
}

export default function PhoneAuthForm({ onSuccess }: PhoneAuthFormProps) {
  const { login, updateUserProfile, user } = useAuth();
  const [step, setStep] = useState<'phone' | 'name' | 'verification'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  
  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: ''
    }
  });
  
  const nameForm = useForm<z.infer<typeof nameSchema>>({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      name: user?.name || ''
    }
  });
  
  const onPhoneSubmit = async (data: z.infer<typeof phoneSchema>) => {
    try {
      setIsLoading(true);
      // In a real app, we would send OTP to this phone number
      // For this demo, we'll skip verification and login directly
      await login(data.phone);
      
      // If user doesn't have a name, ask for it
      if (!user?.name) {
        setStep('name');
      } else {
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const onNameSubmit = async (data: z.infer<typeof nameSchema>) => {
    try {
      setIsLoading(true);
      await updateUserProfile(data.name);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-heading font-bold text-primary">Welcome to The Sanctum</h2>
        <p className="text-muted-foreground">
          {step === 'phone' && "Enter your phone number to continue"}
          {step === 'name' && "Tell us your name to personalize your experience"}
        </p>
      </div>
      
      {step === 'phone' && (
        <Form {...phoneForm}>
          <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
            <FormField
              control={phoneForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your phone number" 
                      type="tel" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Continue"}
            </Button>
          </form>
        </Form>
      )}
      
      {step === 'name' && (
        <Form {...nameForm}>
          <form onSubmit={nameForm.handleSubmit(onNameSubmit)} className="space-y-4">
            <FormField
              control={nameForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Saving..." : "Complete Setup"}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}
