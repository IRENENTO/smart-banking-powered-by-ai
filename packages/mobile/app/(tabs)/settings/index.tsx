import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { GlassCard } from '../../../components/ui/GlassCard';
import { NeonButton } from '../../../components/ui/NeonButton';
import { useAuth } from '../../../hooks/useAuth';

const SettingRow = ({
  icon,
  label,
  value,
  onPress,
  toggle,
  toggleValue,
  onToggle,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (val: boolean) => void;
}) => (
  <TouchableOpacity
    className="flex-row items-center py-4 border-b border-glass-border"
    onPress={onPress}
    disabled={!!toggle}
  >
    <Text className="text-xl mr-3">{icon}</Text>
    <Text className="text-white flex-1 text-base">{label}</Text>
    {value && <Text className="text-gray-400 text-sm">{value}</Text>}
    {toggle && (
      <Switch
        value={toggleValue}
        onValueChange={onToggle}
        trackColor={{ false: '#333', true: '#00F5FF40' }}
        thumbColor={toggleValue ? '#00F5FF' : '#666'}
      />
    )}
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const { user } = useAuth();
  const [stealthMode, setStealthMode] = React.useState(false);
  const [aiSensitivity, setAiSensitivity] = React.useState('Medium');

  return (
    <LinearGradient colors={['#0A0A0F', '#13131A']} className="flex-1">
      <ScrollView className="flex-1 px-4 pt-14" showsVerticalScrollIndicator={false}>
        <Text className="text-white text-2xl font-bold mb-1">Settings</Text>
        <Text className="text-gray-400 text-sm mb-6">Configure security preferences</Text>

        <GlassCard className="mb-4">
          <Text className="text-primary font-bold mb-2 text-sm uppercase tracking-wider">
            Protection
          </Text>
          <SettingRow icon="🛡️" label="Stealth Mode" toggle toggleValue={stealthMode} onToggle={setStealthMode} />
          <SettingRow icon="🤖" label="AI Sensitivity" value={aiSensitivity} onPress={() => {}} />
          <SettingRow icon="📍" label="Geofencing" toggle toggleValue onToggle={() => {}} />
          <SettingRow icon="📷" label="Auto Capture" toggle toggleValue onToggle={() => {}} />
          <SettingRow icon="📱" label="SMS Tracking" toggle toggleValue onToggle={() => {}} />
        </GlassCard>

        <GlassCard className="mb-4">
          <Text className="text-primary font-bold mb-2 text-sm uppercase tracking-wider">
            Emergency
          </Text>
          <SettingRow icon="👥" label="Trusted Contacts" value="3 contacts" onPress={() => {}} />
          <SettingRow icon="🎤" label="Voice Trigger" toggle onToggle={() => {}} />
          <SettingRow icon="🔔" label="SOS Alerts" toggle toggleValue onToggle={() => {}} />
        </GlassCard>

        <GlassCard className="mb-4">
          <Text className="text-primary font-bold mb-2 text-sm uppercase tracking-wider">
            Account
          </Text>
          <SettingRow icon="👤" label="Profile" value={user?.name || ''} onPress={() => {}} />
          <SettingRow icon="🔐" label="Security" value="Biometric" onPress={() => {}} />
          <SettingRow icon="🌐" label="Language" value="English" onPress={() => {}} />
          <SettingRow icon="☁️" label="Cloud Backup" value="Enabled" onPress={() => {}} />
        </GlassCard>

        <GlassCard className="mb-4">
          <Text className="text-primary font-bold mb-2 text-sm uppercase tracking-wider">
            About
          </Text>
          <SettingRow icon="ℹ️" label="Version" value="1.0.0" />
          <SettingRow icon="📄" label="License" value="Premium" />
        </GlassCard>

        <NeonButton
          title="Emergency Alarm"
          variant="danger"
          className="mb-8"
          onPress={() => {}}
        />
      </ScrollView>
    </LinearGradient>
  );
}
