using my.bookshop as my from '../db/data-model';

@requires : 'authenticated-user'
service CatalogService {
    @restrict: [ { grant: '*', to: ['testingBooks'] } ]
    entity Books as projection on my.Books;
}