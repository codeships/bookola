import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton } from '@/components/shared/app-button';
import { GlassPanel } from '@/components/shared/glass-panel';
import { IconButton } from '@/components/shared/icon-button';
import { ScreenShell } from '@/components/shared/screen-shell';
import { uploadBook } from '@/lib/api/uploads';
import { useAuth } from '@/lib/auth/auth-context';
import { useAppTheme } from '@/lib/theme/use-app-theme';

const MAX_SIZE = 6 * 1024 * 1024;
const BOOK_TYPES = ['application/pdf', 'application/epub+zip', 'text/plain'];
const COVER_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function UploadBookScreen() {
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('English');
  const [pages, setPages] = useState('');
  const [bookFile, setBookFile] = useState<DocumentPicker.DocumentPickerAsset>();
  const [coverFile, setCoverFile] = useState<DocumentPicker.DocumentPickerAsset>();
  const [uploading, setUploading] = useState(false);

  async function pickFile(kind: 'book' | 'cover') {
    const result = await DocumentPicker.getDocumentAsync({
      type: kind === 'book' ? BOOK_TYPES : COVER_TYPES,
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if ((asset.size ?? 0) > MAX_SIZE) {
      Alert.alert('File is too large', 'Choose a file smaller than 6 MB.');
      return;
    }
    if (kind === 'book') setBookFile(asset);
    else setCoverFile(asset);
  }

  async function submit() {
    if (!user || !title.trim() || !author.trim() || !bookFile) {
      Alert.alert('Missing details', 'Add a title, author, and book file to continue.');
      return;
    }
    const pageCount = pages.trim() ? Number(pages) : undefined;
    if (pageCount !== undefined && (!Number.isInteger(pageCount) || pageCount < 1)) {
      Alert.alert('Check page count', 'Pages must be a whole number greater than zero.');
      return;
    }
    setUploading(true);
    try {
      const book = await uploadBook({
        title, author, category, description, language, pages: pageCount, bookFile, coverFile,
      }, user.id);
      router.replace(`/book/${book.id}`);
    } catch (error) {
      Alert.alert('Upload failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setUploading(false);
    }
  }

  const inputStyle = [styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceStrong }];

  return (
    <ScreenShell>
      <View style={styles.header}>
        <IconButton icon="←" onPress={() => router.back()} variant="glass" size={40} />
        <Text style={[styles.eyebrow, { color: colors.mutedText }]}>PERSONAL LIBRARY</Text>
        <View style={styles.headerSpacer} />
      </View>

      <Text style={[styles.title, { color: colors.text }]}>Upload a book</Text>
      <Text style={[styles.subtitle, { color: colors.mutedText }]}>Add a clean, readable edition to your Bookola shelf.</Text>

      <GlassPanel style={styles.formCard}>
        <Field label="Title *" value={title} onChangeText={setTitle} placeholder="Book title" style={inputStyle} colors={colors} />
        <Field label="Author *" value={author} onChangeText={setAuthor} placeholder="Author name" style={inputStyle} colors={colors} />
        <View style={styles.twoColumn}>
          <View style={styles.column}><Field label="Category" value={category} onChangeText={setCategory} placeholder="Fiction" style={inputStyle} colors={colors} /></View>
          <View style={styles.column}><Field label="Pages" value={pages} onChangeText={setPages} placeholder="240" keyboardType="number-pad" style={inputStyle} colors={colors} /></View>
        </View>
        <Field label="Language" value={language} onChangeText={setLanguage} placeholder="English" style={inputStyle} colors={colors} />
        <Field label="Description" value={description} onChangeText={setDescription} placeholder="A short summary…" multiline style={[...inputStyle, styles.textarea]} colors={colors} />

        <Text style={[styles.label, { color: colors.text }]}>Book file *</Text>
        <FilePicker label={bookFile?.name ?? 'Choose PDF, EPUB, or TXT'} selected={!!bookFile} onPress={() => pickFile('book')} colors={colors} />
        <Text style={[styles.helper, { color: colors.mutedText }]}>Maximum file size: 6 MB</Text>

        <Text style={[styles.label, styles.coverLabel, { color: colors.text }]}>Cover image</Text>
        <FilePicker label={coverFile?.name ?? 'Add an optional cover'} selected={!!coverFile} onPress={() => pickFile('cover')} colors={colors} />
      </GlassPanel>

      <AppButton label={uploading ? 'Uploading…' : 'Upload book'} onPress={uploading ? undefined : submit} style={uploading ? { opacity: 0.55 } : undefined} />
      <Text style={[styles.privacy, { color: colors.mutedText }]}>Only upload books you have permission to share.</Text>
    </ScreenShell>
  );
}

function Field({ label, colors, ...props }: any) {
  return <View style={styles.field}><Text style={[styles.label, { color: colors.text }]}>{label}</Text><TextInput placeholderTextColor={colors.mutedText} {...props} /></View>;
}

function FilePicker({ label, selected, onPress, colors }: any) {
  return <Pressable onPress={onPress} style={[styles.filePicker, { borderColor: selected ? colors.success : colors.border, backgroundColor: colors.background }]}><Text style={styles.fileIcon}>{selected ? '✓' : '+'}</Text><Text numberOfLines={1} style={[styles.fileText, { color: selected ? colors.text : colors.mutedText }]}>{label}</Text><Text style={[styles.browse, { color: colors.primary }]}>Browse</Text></Pressable>;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  headerSpacer: { width: 40 }, eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.4 },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: -0.6, marginBottom: 8 },
  subtitle: { fontSize: 15, lineHeight: 23, marginBottom: 22, maxWidth: 440 },
  formCard: { padding: 20, marginBottom: 18 }, field: { marginBottom: 17 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  input: { minHeight: 50, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, fontSize: 15 },
  textarea: { minHeight: 100, paddingTop: 13, textAlignVertical: 'top' },
  twoColumn: { flexDirection: 'row', gap: 12 }, column: { flex: 1 },
  filePicker: { minHeight: 58, borderWidth: 1, borderStyle: 'dashed', borderRadius: 14, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  fileIcon: { fontSize: 20, width: 22, textAlign: 'center' }, fileText: { flex: 1, fontSize: 14 }, browse: { fontSize: 13, fontWeight: '700' },
  helper: { fontSize: 11, marginTop: 7 }, coverLabel: { marginTop: 18 }, privacy: { fontSize: 11, textAlign: 'center', marginTop: 12, lineHeight: 17 },
});
