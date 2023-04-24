import {
  BlockRepository,
  ElementRepository,
  PageRepository,
  PlaylistRepository,
  SectionRepository,
  SermonRepository,
  StreamingServiceRepository,
  FileRepository,
  EventRepository,
  EventExceptionRepository,
} from ".";

export class Repositories {
  public block: BlockRepository;
  public element: ElementRepository;
  public file: FileRepository;
  public page: PageRepository;
  public section: SectionRepository;

  public playlist: PlaylistRepository;
  public sermon: SermonRepository;
  public streamingService: StreamingServiceRepository;

  public event: EventRepository;
  public eventException: EventExceptionRepository;

  private static _current: Repositories = null;
  public static getCurrent = () => {
    if (Repositories._current === null) Repositories._current = new Repositories();
    return Repositories._current;
  }

  constructor() {
    this.block = new BlockRepository();
    this.element = new ElementRepository();
    this.event = new EventRepository();
    this.eventException = new EventExceptionRepository();
    this.file = new FileRepository();
    this.page = new PageRepository();
    this.section = new SectionRepository();
    this.playlist = new PlaylistRepository();
    this.sermon = new SermonRepository();
    this.streamingService = new StreamingServiceRepository();
  }
}
