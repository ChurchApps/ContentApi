import {
  BlockRepository,
  ElementRepository,
  PageRepository,
  PlaylistRepository,
  SectionRepository,
  SermonRepository,
  StreamingServiceRepository,
  FileRepository,
  GlobalStyleRepository,
  EventRepository,
  EventExceptionRepository,
  CuratedCalendarRepository,
  CuratedEventRepository,
  LinkRepository,
  SettingRepository,
  BibleVerseRepository,
  BibleBookRepository,
  BibleTranslationRepository,
  BibleChapterRepository,
  BibleVerseTextTextRepository,
  BibleLookupRepository,
  SongDetailRepository,
  SongRepository,
  ArrangementRepository,
  SongDetailLinkRepository,
  ArrangementKeyRepository
} from ".";

export class Repositories {
  public block: BlockRepository;
  public globalStyle: GlobalStyleRepository;
  public element: ElementRepository;
  public file: FileRepository;
  public link: LinkRepository;
  public page: PageRepository;
  public section: SectionRepository;

  public playlist: PlaylistRepository;
  public sermon: SermonRepository;
  public streamingService: StreamingServiceRepository;

  public event: EventRepository;
  public eventException: EventExceptionRepository;
  public curatedCalendar: CuratedCalendarRepository;
  public curatedEvent: CuratedEventRepository;

  public setting: SettingRepository;

  public bibleTranslation: BibleTranslationRepository;
  public bibleBook: BibleBookRepository;
  public bibleChapter: BibleChapterRepository;
  public bibleVerse: BibleVerseRepository;
  public bibleVerseText: BibleVerseTextTextRepository;
  public bibleLookup: BibleLookupRepository;

  public arrangement: ArrangementRepository;
  public arrangementKey: ArrangementKeyRepository;
  public songDetail: SongDetailRepository;
  public songDetailLink: SongDetailLinkRepository;
  public song: SongRepository;

  private static _current: Repositories = null;
  public static getCurrent = () => {
    if (Repositories._current === null) Repositories._current = new Repositories();
    return Repositories._current;
  };

  constructor() {
    this.arrangement = new ArrangementRepository();
    this.arrangementKey = new ArrangementKeyRepository();
    this.bibleBook = new BibleBookRepository();
    this.bibleChapter = new BibleChapterRepository();
    this.bibleTranslation = new BibleTranslationRepository();
    this.bibleVerse = new BibleVerseRepository();
    this.bibleVerseText = new BibleVerseTextTextRepository();
    this.bibleLookup = new BibleLookupRepository();
    this.block = new BlockRepository();
    this.globalStyle = new GlobalStyleRepository();
    this.curatedCalendar = new CuratedCalendarRepository();
    this.curatedEvent = new CuratedEventRepository();
    this.element = new ElementRepository();
    this.event = new EventRepository();
    this.eventException = new EventExceptionRepository();
    this.file = new FileRepository();
    this.link = new LinkRepository();
    this.page = new PageRepository();
    this.section = new SectionRepository();
    this.playlist = new PlaylistRepository();
    this.sermon = new SermonRepository();
    this.streamingService = new StreamingServiceRepository();
    this.setting = new SettingRepository();
    this.songDetail = new SongDetailRepository();
    this.songDetailLink = new SongDetailLinkRepository();
    this.song = new SongRepository();
  }
}
